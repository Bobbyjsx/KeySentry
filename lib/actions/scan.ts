"use server"

import { createClient } from "@/lib/supabase/server"
import { keysToCamel } from "@/lib/case-transform"
import { runGitHubScan, type ScanSource } from "@/lib/core/scan-manager"

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Create scan history record in_progress
  const { data: scanData, error: scanError } = await supabase
    .from("scan_history")
    .insert({
      user_id: user.id,
      scan_date: new Date().toISOString(),
      keys_found: 0,
      sources_scanned: sources.length,
      duration_seconds: 0,
      status: "in_progress",
    })
    .select()
    .single()

  if (scanError) throw scanError

  try {
    const result = await runGitHubScan(user.id, sources, scanData.id)

    return {
      success: true,
      keysFound: result.keysFound,
      durationSeconds: result.durationSeconds,
      scanId: scanData.id,
    }
  } catch (error: any) {
    // Update status to failed
    await supabase
      .from("scan_history")
      .update({ status: "failed" })
      .eq("id", scanData.id)

    throw error
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
}

export async function getScanHistoryAction(): Promise<ScanHistoryRecord[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("user_id", user.id)
    .order("scan_date", { ascending: false })

  if (error) throw error

  return keysToCamel<ScanHistoryRecord[]>(data || [])
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: scanData, error: scanError } = await supabase
    .from("scan_history")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .single()

  if (scanError) throw scanError

  const { data: keysData, error: keysError } = await supabase
    .from("api_keys")
    .select("*")
    .eq("scan_id", scanId)
    .eq("user_id", user.id)

  if (keysError) throw keysError

  return {
    scan: keysToCamel<ScanHistoryRecord>(scanData),
    keys: keysToCamel<ScanDetails["keys"]>(keysData || []),
  }
}
