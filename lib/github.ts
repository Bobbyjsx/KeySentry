import { Octokit } from "@octokit/rest"
import type { ApiKey } from "@/types"

// Create Octokit instance with token if available
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN,
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

// Get all search patterns
export async function searchAllPatterns(): Promise<string[]> {
  try {
    const response = await fetch("/api/github/patterns")
    if (!response.ok) {
      throw new Error(`Failed to fetch patterns: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching patterns:", error)
    return []
  }
}

// Search for a single pattern
export async function searchPattern(pattern: string): Promise<ApiKey[]> {
  try {
    const response = await fetch(`/api/github/search?pattern=${encodeURIComponent(pattern)}`)

    if (response.status === 429) {
      // Rate limited, return empty array
      console.warn("Rate limited by GitHub API")
      return []
    }

    if (!response.ok) {
      throw new Error(`Failed to search pattern: ${response.statusText}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error(`Error searching pattern "${pattern}":`, error)
    return []
  }
}
