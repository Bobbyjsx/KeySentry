"use server"

import { keysToCamel } from "@/lib/case-transform"
import { runGitHubScan, type ScanSource } from "@/lib/core/scan-manager"
import {
  createScanHistoryDAL,
  getScanHistoryDAL,
  getScanHistoryDetailsDAL,
  getScanDiscoveriesDAL,
} from "@/lib/dal/scans"
import { requireAuth } from "@/lib/auth-server"

export interface ScanResult {
  success: boolean
  keysFound: number
  durationSeconds: number
  scanId: string
}

export async function startScanAction(
  sources: ScanSource[],
  scanDepth: "shallow" | "deep"
): Promise<ScanResult> {
  const { user, supabase } = await requireAuth()

  // Create scan history record in_progress via DAL
  const scanHistoryData = {
    scan_date: new Date().toISOString(),
    keys_found: 0,
    sources_scanned: sources.length,
    duration_seconds: 0,
    status: "in_progress",
    sources: sources as any,
    repos_scanned: 0,
    files_scanned: 0,
  }

  const scanData = await createScanHistoryDAL(user.id, scanHistoryData)

  // Invoke the Supabase Edge Function to process the scan asynchronously
  try {
    const { error: invokeError } = await supabase.functions.invoke("run-scan", {
      body: {
        userId: user.id,
        sources,
        scanId: scanData.id,
      },
    })
    if (invokeError) throw invokeError
  } catch (error) {
    console.error("Failed to invoke Edge Function, falling back to local background execution:", error)
    // Fallback: run local background task if Edge Function fails to trigger
    runGitHubScan(user.id, sources, scanData.id).catch((err: any) => {
      console.error(`Background fallback scan failed for session ${scanData.id}:`, err)
    })
  }

  return {
    success: true,
    keysFound: 0,
    durationSeconds: 0,
    scanId: scanData.id,
  }
}

export interface ScanHistoryRecord {
  id: string
  userId: string
  scanDate: string
  keysFound: number
  sourcesScanned: number
  durationSeconds: number
  status: string
  sources?: ScanSource[]
  reposScanned: number
  filesScanned: number
}

export async function getScanHistoryAction(): Promise<ScanHistoryRecord[]> {
  const { user } = await requireAuth()
  const data = await getScanHistoryDAL(user.id)
  return keysToCamel<ScanHistoryRecord[]>(data)
}

export interface ScanDetails {
  scan: ScanHistoryRecord
  keys: {
    id: string
    keyHash: string
    provider: string
    discoveredAt: string
    status: string
    source: string
    link?: string | null
    repository?: string | null
    riskLevel: string
  }[]
}

export async function getScanDetailsAction(scanId: string): Promise<ScanDetails> {
  const { user } = await requireAuth()
  const scanData = await getScanHistoryDetailsDAL(user.id, scanId)
  const keysData = await getScanDiscoveriesDAL(user.id, scanId)

  return {
    scan: keysToCamel<ScanHistoryRecord>(scanData),
    keys: keysToCamel<ScanDetails["keys"]>(keysData || []),
  }
}
