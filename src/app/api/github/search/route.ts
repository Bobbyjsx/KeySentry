import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import type { ApiKey } from "@/types"
import { mockApiKeys } from "@/data/mockData"

// Create Octokit instance with token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN,
})

// Match real OpenAI API key pattern
const openAiKeyRegex = /sk-[a-zA-Z0-9]{48}/

// Track rate limit state globally
let rateLimitRemaining = 30
let rateLimitReset = 0
let isRateLimited = false

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pattern = searchParams.get("pattern")

  if (!pattern) {
    return NextResponse.json({ error: "Pattern is required" }, { status: 400 })
  }

  try {
    // Check if we're rate limited
    try {
      const { data } = await octokit.rateLimit.get()
      rateLimitRemaining = data.rate.remaining
      rateLimitReset = data.rate.reset
      isRateLimited = rateLimitRemaining < 5
    } catch (error) {
      console.error("Failed to check rate limit:", error)
    }

    if (isRateLimited) {
      const resetTime = new Date(rateLimitReset * 1000)
      const waitTime = resetTime.getTime() - Date.now()
      console.warn(`Rate limit low (${rateLimitRemaining}). Waiting ${Math.ceil(waitTime / 1000)}s...`)

      // If we're in development mode, return mock data instead of waiting
      if (process.env.NODE_ENV === "development") {
        console.log("DEV mode: Returning mock data instead of waiting for rate limit")
        return NextResponse.json({
          items: mockApiKeys.slice(0, 5).map((key) => ({
            ...key,
            source: `GitHub (${pattern})`,
            discoveredAt: new Date().toISOString().split("T")[0],
          })),
          rateLimit: {
            remaining: rateLimitRemaining,
            reset: resetTime.toISOString(),
          },
        })
      }

      // In production, return a rate limit error
      return NextResponse.json(
        {
          items: [],
          error: "Rate limited",
          rateLimit: {
            remaining: rateLimitRemaining,
            reset: resetTime.toISOString(),
          },
        },
        { status: 429 },
      )
    }

    const result = await octokit.search.code({
      q: pattern,
      per_page: 5, // Reduced from 10 to minimize rate limit issues
    })

    // Update our rate limit tracking
    if (result.headers) {
      rateLimitRemaining = Number.parseInt((result.headers["x-ratelimit-remaining"] as string) || "30")
      rateLimitReset = Number.parseInt((result.headers["x-ratelimit-reset"] as string) || "0")
      isRateLimited = rateLimitRemaining < 5
    }

    const items: ApiKey[] = []

    for (const item of result.data.items) {
      try {
        // Check rate limit before each content request
        if (rateLimitRemaining < 2) {
          console.warn(`Rate limit critical (${rateLimitRemaining}). Pausing content fetching.`)
          break // Stop processing more items in this batch
        }

        const { data: contentData } = await octokit.repos.getContent({
          owner: item.repository.owner.login,
          repo: item.repository.name,
          path: item.path,
          ref: item.sha,
        })

        if (!("content" in contentData)) continue

        const decodedContent = Buffer.from(contentData.content, "base64").toString("utf-8")

        if (openAiKeyRegex.test(decodedContent)) {
          items.push({
            id: item.sha,
            key: openAiKeyRegex.exec(decodedContent)?.[0] || "sk-redacted",
            provider: item.name.toLowerCase().includes("anthropic") ? "Anthropic" : "OpenAI",
            discoveredAt: new Date().toISOString().split("T")[0],
            status: "active",
            source: "GitHub",
            link: item.html_url,
            repository: item.repository.full_name,
            discoveredBy: "API Search",
          })
        }
      } catch (innerError: any) {
        // Check if this is a rate limit error
        if (innerError.status === 403 && innerError.response?.headers?.["x-ratelimit-remaining"] === "0") {
          rateLimitRemaining = 0
          rateLimitReset = Number.parseInt(innerError.response.headers["x-ratelimit-reset"] || "0")
          isRateLimited = true
          break // Stop processing more items
        }

        console.warn(`Failed to get content for ${item.path}:`, innerError)
      }

      // We don't need to add delay here since this is server-side
      // and we're not making requests in a tight loop
    }

    return NextResponse.json({
      items,
      rateLimit: {
        remaining: rateLimitRemaining,
        reset: new Date(rateLimitReset * 1000).toISOString(),
      },
    })
  } catch (error: any) {
    // Handle rate limit errors
    if (error.status === 403 && error.response?.headers?.["x-ratelimit-remaining"] === "0") {
      rateLimitRemaining = 0
      rateLimitReset = Number.parseInt(error.response.headers["x-ratelimit-reset"] || "0")
      isRateLimited = true

      console.warn("Hit GitHub rate limit. Returning empty results for now.")
      return NextResponse.json(
        {
          items: [],
          error: "Rate limited",
          rateLimit: {
            remaining: 0,
            reset: new Date(rateLimitReset * 1000).toISOString(),
          },
        },
        { status: 429 },
      )
    }

    console.error("GitHub search error:", error.message || error)
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
