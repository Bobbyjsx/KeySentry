"use server"

import { keysToCamel } from "@/lib/case-transform"
import { getDiscoveriesDAL, archiveDiscoveryDAL, deleteDiscoveryDAL } from "@/lib/dal/discoveries"
import { requireAuth } from "@/lib/auth-server"

export interface ApiKeyDiscovery {
  id: string
  userId: string
  keyHash: string
  provider: string
  status: string
  source: string
  link: string | null
  repository: string | null
  riskLevel: string
  discoveredAt: string
  isArchived: boolean
  notes: string | null
}

export async function getDiscoveriesAction(keyId?: string): Promise<ApiKeyDiscovery[]> {
  const { user } = await requireAuth()
  const data = await getDiscoveriesDAL(user.id, keyId)
  return keysToCamel<ApiKeyDiscovery[]>(data)
}

export async function archiveDiscoveryAction(id: string): Promise<ApiKeyDiscovery> {
  const { user } = await requireAuth()
  const data = await archiveDiscoveryDAL(user.id, id)
  return keysToCamel<ApiKeyDiscovery>(data)
}

export async function deleteDiscoveryAction(id: string): Promise<void> {
  const { user } = await requireAuth()
  await deleteDiscoveryDAL(user.id, id)
}
