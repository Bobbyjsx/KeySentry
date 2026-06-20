import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Octokit } from "@octokit/rest"

const openAiKeyRegex = /sk-[a-zA-Z0-9]{48}/

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = session.user
  const { sources, scanDepth, scanId } = await request.json()

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return NextResponse.json({ error: "Sources are required" }, { status: 400 })
  }

  // Get GitHub Token (from settings, or env)
  let githubToken = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN
  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("github_token")
      .eq("user_id", user.id)
      .single()
    if (settings?.github_token) {
      githubToken = settings.github_token
    }
  } catch (err) {
    console.error("Failed to fetch user settings github_token", err)
  }

  const octokit = new Octokit({ auth: githubToken })

  // Trigger asynchronous execution to keep request short if needed, but since it's Next.js API,
  // we can run a quick mock-coupled scan or actual scan.
  // Let's do the scan logic!
  const startTime = Date.now()
  let keysFoundCount = 0
  const discoveredKeys: any[] = []

  for (const src of sources) {
    if (src.type !== "github" || !src.value) continue

    try {
      // Find files using octokit code search or repo code search
      const query = `repo:${src.value} sk-`
      const searchRes = await octokit.search.code({ q: query, per_page: 10 })

      for (const item of searchRes.data.items) {
        try {
          const { data: contentData } = await octokit.repos.getContent({
            owner: item.repository.owner.login,
            repo: item.repository.name,
            path: item.path,
            ref: item.sha,
          })

          if (!("content" in contentData)) continue
          const decodedContent = Buffer.from(contentData.content, "base64").toString("utf-8")

          const matches = decodedContent.match(openAiKeyRegex)
          if (matches) {
            for (const matchedKey of matches) {
              keysFoundCount++
              // Insert Key to public.api_keys
              const keyData = {
                user_id: user.id,
                key_hash: matchedKey.substring(0, 8) + "...redacted..." + matchedKey.substring(matchedKey.length - 8),
                provider: "OpenAI",
                status: "active",
                source: "GitHub",
                link: item.html_url,
                repository: item.repository.full_name,
                risk_level: "high",
              }

              const { data: insertedKey, error: keyErr } = await supabase
                .from("api_keys")
                .insert(keyData)
                .select()
                .single()

              if (keyErr) {
                console.error("Failed to insert api_key", keyErr)
              } else if (insertedKey) {
                // Insert Alert
                await supabase.from("alerts").insert({
                  user_id: user.id,
                  api_key_id: insertedKey.id,
                  title: `Exposed API Key Discovered`,
                  description: `Discovered exposed OpenAI API key in ${item.repository.full_name}/${item.path}`,
                  severity: "high",
                  is_read: false,
                })
              }
            }
          }
        } catch (fileErr) {
          console.error(`Error scanning file ${item.path}`, fileErr)
        }
      }
    } catch (srcErr: any) {
      console.error(`Error searching code for source ${src.value}`, srcErr.message)
    }
  }

  const durationSeconds = Math.ceil((Date.now() - startTime) / 1000)

  // Update scan history
  await supabase
    .from("scan_history")
    .update({
      keys_found: keysFoundCount,
      duration_seconds: durationSeconds,
      status: "completed",
    })
    .eq("id", scanId)

  return NextResponse.json({
    success: true,
    keysFound: keysFoundCount,
    durationSeconds,
  })
}
