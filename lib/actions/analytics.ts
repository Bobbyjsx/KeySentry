"use server"

import { api } from "@/lib/axios"
import { throwServerActionError } from "../server-error"

export interface ScanHistoryAnalytics {
  id: string
  scanDate: string
  keysFound: number
  filesScanned: number
  reposScanned: number
  sourcesScanned: number
  durationSeconds: number
  status: string
}

import type { ApiKeyDiscovery } from "./discoveries"

export interface AnalyticsData {
  keys: ApiKeyDiscovery[]
  scanHistory: ScanHistoryAnalytics[]
}

export async function getAnalyticsDataAction(): Promise<AnalyticsData> {
  try {
    const { data } = await api.get("/api/v1/analytics")
    return data
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return throwServerActionError(error) as any
  }
}
