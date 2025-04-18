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

// export interface ApiKey {
//   id: string;
//   provider: 'OpenAI' | 'Anthropic';
//   discoveredAt: string; // ISO date string
//   status: 'active' | 'revoked';
//   source: 'GitHub';
//   link: string;
//   repository: string;
//   discoveredBy: string;
// }
