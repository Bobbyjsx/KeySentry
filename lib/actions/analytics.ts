"use server"

import { createClient } from "@/lib/supabase/server"
import { keysToCamel } from "@/lib/case-transform"
import type { ApiKeyDiscovery } from "./discoveries"

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get API keys data
  const { data: keysData, error: keysErr } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", user.id)

  if (keysErr) throw keysErr

  // Get scan history data
  const { data: scanHistoryData, error: scanErr } = await supabase
    .from("scan_history")
    .select("*")
    .eq("user_id", user.id)
    .order("scan_date", { ascending: false })
    .limit(30)

  if (scanErr) throw scanErr

  return {
    keys: keysToCamel<ApiKeyDiscovery[]>(keysData || []),
    scanHistory: keysToCamel<ScanHistoryAnalytics[]>(scanHistoryData || []),
  }
}
