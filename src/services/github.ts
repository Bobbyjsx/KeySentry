import { Octokit } from "@octokit/rest"
import type { ApiKey } from "../types"
import { mockApiKeys } from "../data/mockData"

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
})

// Search patterns split to avoid rate limits and increase precision
const searchPatterns = [
  "filename:.env sk- openai",
  "filename:.env sk- gpt",
  "filename:.config sk- openai",
  "filename:.json sk- openai",
  "filename:.yml sk- openai",
  "filename:.yaml sk- gpt",
  "filename:.envrc sk- openai",
  "filename:.secret sk- openai",
  "filename:.private sk- openai",
]

// Match real OpenAI API key pattern
const openAiKeyRegex = /sk-[a-zA-Z0-9]{48}/

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Track rate limit state globally
let rateLimitRemaining = 30
let rateLimitReset = 0
let isRateLimited = false

const checkRateLimit = async () => {
  try {
    const { data } = await octokit.rateLimit.get()
    rateLimitRemaining = data.rate.remaining
    rateLimitReset = data.rate.reset
    isRateLimited = rateLimitRemaining < 5

    return {
      remaining: rateLimitRemaining,
      resetTime: new Date(rateLimitReset * 1000),
      isLimited: isRateLimited,
    }
  } catch (error) {
    console.error("Failed to check rate limit:", error)
    return {
      remaining: 0,
      resetTime: new Date(Date.now() + 60000), // Assume 1 minute if we can't check
      isLimited: true,
    }
  }
}

// Search for a single pattern
export const searchPattern = async (pattern: string): Promise<ApiKey[]> => {
  // Check if we're rate limited
  const { remaining, resetTime, isLimited } = await checkRateLimit()

  if (isLimited) {
    const waitTime = resetTime.getTime() - Date.now()
    console.warn(`Rate limit low (${remaining}). Waiting ${Math.ceil(waitTime / 1000)}s...`)

    // If we're in development mode, return mock data instead of waiting
    if (import.meta.env.DEV) {
      console.log("DEV mode: Returning mock data instead of waiting for rate limit")
      return mockApiKeys.slice(0, 5).map((key) => ({
        ...key,
        source: `GitHub (${pattern})`,
        discoveredAt: new Date().toISOString().split("T")[0],
      }))
    }

    // In production, wait for the rate limit to reset
    await delay(waitTime + 1000) // Add a small buffer
  }

  try {
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
          const waitTime = new Date(rateLimitReset * 1000).getTime() - Date.now()
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

      // Add delay between content requests to avoid secondary rate limits
      await delay(1000)
    }

    return items
  } catch (error: any) {
    // Handle rate limit errors
    if (error.status === 403 && error.response?.headers?.["x-ratelimit-remaining"] === "0") {
      rateLimitRemaining = 0
      rateLimitReset = Number.parseInt(error.response.headers["x-ratelimit-reset"] || "0")
      isRateLimited = true

      console.warn("Hit GitHub rate limit. Returning empty results for now.")
      return []
    }

    console.error("GitHub search error:", error.message || error)
    throw error
  }
}

// Get all patterns but don't wait for all to complete
export const searchAllPatterns = async (): Promise<string[]> => {
  // Just return the patterns - we'll query them individually
  return searchPatterns
}
