"use server"

import { api } from "@/lib/axios"
import { isAxiosError } from "axios"
import { throwServerActionError } from "../server-error"

export interface ApiKeyDiscovery {
  id: string
  keyHash: string
  provider: string
  status: "active" | "expired" | "revoked" | "unknown"
  source: string
  discoveredAt: string
  riskLevel: "critical" | "high" | "medium" | "low"
  link?: string
  repository?: string
  notes?: string
}

export async function getDiscoveriesAction(keyId?: string): Promise<ApiKeyDiscovery[]> {
  try {
    const url = keyId ? `/api/v1/discoveries?key=${keyId}` : "/api/v1/discoveries"
    const { data } = await api.get(url)
    return data
  } catch (error) {
    console.error("Error fetching discoveries:", error)
    return throwServerActionError(error) as any
  }
}

export async function updateDiscoveryStatusAction(
  id: string,
  status: "open" | "resolved" | "false_positive",
  notes?: string
) {
  try {
    await api.patch(`/api/v1/discoveries/${id}`, { status, notes })
    return { success: true }
  } catch (error) {
    console.error("Error updating discovery status:", error)
    return throwServerActionError(error)
  }
}

export async function archiveDiscoveryAction(id: string) {
  try {
    await api.post(`/api/v1/discoveries/${id}/archive`)
    return { success: true }
  } catch (error) {
    console.error("Error archiving discovery:", error)
    return throwServerActionError(error)
  }
}

export async function deleteDiscoveryAction(id: string) {
  try {
    await api.delete(`/api/v1/discoveries/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting discovery:", error)
    return throwServerActionError(error)
  }
}
