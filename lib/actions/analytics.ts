"use server"

import { keysToCamel } from "@/lib/case-transform"
import type { ApiKeyDiscovery } from "./discoveries"
import { getAllDiscoveriesDAL } from "@/lib/dal/discoveries"
import { getRecentScanHistoryDAL } from "@/lib/dal/scans"
import { requireAuth } from "@/lib/auth-server"

export interface ScanHistoryAnalytics {
  id: string
  userId: string
  scanDate: string
  keysFound: number
  sourcesScanned: number
  durationSeconds: number
  status: string
}

export interface AnalyticsData {
  keys: ApiKeyDiscovery[]
  scanHistory: ScanHistoryAnalytics[]
}

export async function getAnalyticsDataAction(): Promise<AnalyticsData> {
  const { user } = await requireAuth()

  // Get API keys data via DAL
  const keysData = await getAllDiscoveriesDAL(user.id)

  // Get scan history data via DAL (last 30 scans)
  const scanHistoryData = await getRecentScanHistoryDAL(user.id, 30)

  return {
    keys: keysToCamel<ApiKeyDiscovery[]>(keysData || []),
    scanHistory: keysToCamel<ScanHistoryAnalytics[]>(scanHistoryData || []),
  }
}
