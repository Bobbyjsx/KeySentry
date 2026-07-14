import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id parameter" }, { status: 400 })
    }

    const bodyText = await req.text()

    // Webhook signature / token verification
    const signature = req.headers.get("x-hub-signature-256")
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET
    const authToken = process.env.GITHUB_WEBHOOK_TOKEN || process.env.WEBHOOK_AUTH_TOKEN
    const authHeader = req.headers.get("authorization")

    let isAuthorized = false

    // 1. Check signature if secret is defined and signature header is present
    if (signature && webhookSecret) {
      try {
        const hmac = crypto.createHmac("sha256", webhookSecret)
        const digest = "sha256=" + hmac.update(bodyText).digest("hex")
        if (digest.length === signature.length && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
          isAuthorized = true
        }
      } catch (err) {
        console.error("Signature verification error:", err)
      }
    }

    // 2. Check auth token if signature check didn't pass and token is defined
    if (!isAuthorized && authToken) {
      if (authHeader === `Bearer ${authToken}`) {
        isAuthorized = true
      } else if (searchParams.get("token") === authToken) {
        isAuthorized = true
      }
    }

    // Require authorization to protect the endpoint
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid webhook signature or authentication token" },
        { status: 401 }
      )
    }

    const event = req.headers.get("x-github-event")
    const payload = JSON.parse(bodyText)

    // Determine the repository to scan
    const repoFullName = payload.repository?.full_name
    if (!repoFullName) {
      return NextResponse.json({ error: "No repository context found in webhook payload" }, { status: 400 })
    }

    // Determine trigger info
    let trigger = "webhook"
    let triggerLink: string | null = null

    if (event === "push") {
      trigger = "push"
      triggerLink = payload.head_commit?.url || payload.repository?.html_url || null
    } else if (event === "pull_request") {
      trigger = "pr"
      triggerLink = payload.pull_request?.html_url || payload.repository?.html_url || null
    } else if (event === "repository") {
      trigger = "repo"
      triggerLink = payload.repository?.html_url || null
    } else {
      trigger = `webhook:${event || "unknown"}`
      triggerLink = payload.repository?.html_url || null
    }

    const sources = [{ type: "github" as const, value: repoFullName }]

    // Initialize Supabase Admin Client using service role key to bypass RLS policies
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create the scan history entry
    const { data: scanData, error: insertError } = await supabaseAdmin
      .from("scan_history")
      .insert({
        user_id: userId,
        scan_date: new Date().toISOString(),
        keys_found: 0,
        sources_scanned: 1,
        duration_seconds: 0,
        status: "in_progress",
        sources: sources as any,
        repos_scanned: 0,
        files_scanned: 0,
        trigger,
        trigger_link: triggerLink,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to insert scan history via webhook:", insertError)
      return NextResponse.json({ error: "Failed to initialize scan history" }, { status: 500 })
    }

    // Invoke the edge function run-scan asynchronously
    try {
      const { error: invokeError } = await supabaseAdmin.functions.invoke("run-scan", {
        body: {
          userId,
          sources,
          scanId: scanData.id,
        },
      })
      if (invokeError) throw invokeError
    } catch (error) {
      console.error("Failed to invoke Edge Function for webhook, running local fallback:", error)
      // Fallback: run local background scan
      const { runGitHubScan } = await import("@/lib/core/scan-manager")
      runGitHubScan(userId, sources, scanData.id).catch((err) => {
        console.error("Local webhook fallback scan failed:", err)
      })
    }

    return NextResponse.json({
      success: true,
      message: `Scan initialized for target repo: ${repoFullName}`,
      scanId: scanData.id,
    })
  } catch (error: any) {
    console.error("Error processing GitHub webhook:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
