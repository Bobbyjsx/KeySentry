import type { ApiKey } from "@/types"

// Generate realistic-looking API keys for each provider
const generateMockKey = (provider: string): string => {
  switch (provider) {
    case "OpenAI":
      return `sk-${generateRandomString(24)}`
    case "Anthropic":
      return `sk-ant-${generateRandomString(43)}`
    case "Cohere":
      return `${generateRandomString(32)}`
    case "Midjourney":
      return `midjourney-${generateRandomString(24)}`
    default:
      return `key-${generateRandomString(24)}`
  }
}

// Helper to generate random string of given length
const generateRandomString = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate mock sources
const sources = [
  "GitHub public repository",
  "GitLab public project",
  "Pastebin",
  "Public S3 bucket",
  "Trello board",
  "Discord chat",
  "Public gist",
  "npm package",
  "Slack workspace",
  "Exposed .env file",
]

// Generate mock discovered dates (within last 30 days)
const generateRandomDate = (): string => {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  now.setDate(now.getDate() - daysAgo)
  return now.toISOString().split("T")[0]
}

// Generate mock API keys
export const mockApiKeys: ApiKey[] = Array.from({ length: 20 }, (_, i) => {
  const providers = ["OpenAI", "Anthropic", "Cohere", "Midjourney", "Other"]
  const statuses = ["active", "expired", "revoked", "unknown"]
  const provider = providers[Math.floor(Math.random() * providers.length)]
  const source = sources[Math.floor(Math.random() * sources.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]

  return {
    id: `key-${i + 1}`,
    key: generateMockKey(provider),
    provider,
    discoveredAt: generateRandomDate(),
    status,
    source,
    link: `https://example.com/source/${i + 1}`,
    rateLimit: Math.random() > 0.5 ? `${Math.floor(Math.random() * 100) + 1}/min` : undefined,
    usageCount: Math.random() > 0.3 ? Math.floor(Math.random() * 1000) : undefined,
    discoveredBy: Math.random() > 0.7 ? "Automated scanner" : "Manual report",
    repository: Math.random() > 0.6 ? `user/repo-${Math.floor(Math.random() * 100)}` : undefined,
    additionalInfo:
      Math.random() > 0.8
        ? "This key appears to have access to production resources and should be rotated immediately."
        : undefined,
  }
})
