export interface ApiKey {
  id: string
  key: string
  provider: string
  discoveredAt: string
  status: string
  source: string
  link?: string
  rateLimit?: string
  usageCount?: number
  discoveredBy?: string
  repository?: string
  additionalInfo?: string
}
