"use client"

import { BarChart, Database, AlertTriangle, Shield } from "lucide-react"
import type { ApiKeyDiscovery } from "@/lib/actions/discoveries"
import type { ScanHistoryAnalytics } from "@/lib/actions/analytics"

export default function AnalyticsOverview({
  keys,
  scanHistory,
}: {
  keys: ApiKeyDiscovery[]
  scanHistory: ScanHistoryAnalytics[]
}) {
  // Calculate statistics
  const totalKeys = keys.length
  const activeKeys = keys.filter((key) => key.status === "active").length
  const highRiskKeys = keys.filter((key) => key.riskLevel === "high").length
  const providers = new Set(keys.map((key) => key.provider)).size

  // Calculate scan statistics
  const totalScans = scanHistory.length
  const successfulScans = scanHistory.filter((scan) => scan.status === "completed").length
  const averageKeysPerScan =
    totalScans > 0 ? Math.round(scanHistory.reduce((sum, scan) => sum + scan.keysFound, 0) / totalScans) : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-sans">
      <div className="rounded-sm border border-hairline bg-canvas-card p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-mono text-caption-mono-sm uppercase text-gray-500 tracking-caption-mono-sm">Total Discoveries</p>
            <p className="text-3xl font-light text-white tracking-display-sm">{totalKeys}</p>
          </div>
          <div className="rounded-pill border border-hairline p-2 bg-canvas-soft">
            <Database className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="mt-4 border-t border-hairline/50 pt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">Average per scan</span>
          <span className="text-accent-breeze font-mono">+{averageKeysPerScan}</span>
        </div>
      </div>

      <div className="rounded-sm border border-hairline bg-canvas-card p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-mono text-caption-mono-sm uppercase text-gray-500 tracking-caption-mono-sm">High Risk Keys</p>
            <p className="text-3xl font-light text-white tracking-display-sm">{highRiskKeys}</p>
          </div>
          <div className="rounded-pill border border-hairline p-2 bg-canvas-soft">
            <AlertTriangle className="h-4 w-4 text-accent-sunset" />
          </div>
        </div>
        <div className="mt-4 border-t border-hairline/50 pt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">Ratio of total</span>
          <span className="text-accent-sunset font-mono">
            {Math.round((highRiskKeys / totalKeys) * 100) || 0}%
          </span>
        </div>
      </div>

      <div className="rounded-sm border border-hairline bg-canvas-card p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-mono text-caption-mono-sm uppercase text-gray-500 tracking-caption-mono-sm">Active Keys</p>
            <p className="text-3xl font-light text-white tracking-display-sm">{activeKeys}</p>
          </div>
          <div className="rounded-pill border border-hairline p-2 bg-canvas-soft">
            <Shield className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="mt-4 border-t border-hairline/50 pt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">Unrevoked proportion</span>
          <span className="text-white font-mono">
            {Math.round((activeKeys / totalKeys) * 100) || 0}%
          </span>
        </div>
      </div>

      <div className="rounded-sm border border-hairline bg-canvas-card p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-mono text-caption-mono-sm uppercase text-gray-500 tracking-caption-mono-sm">API Providers</p>
            <p className="text-3xl font-light text-white tracking-display-sm">{providers}</p>
          </div>
          <div className="rounded-pill border border-hairline p-2 bg-canvas-soft">
            <BarChart className="h-4 w-4 text-accent-twilight" />
          </div>
        </div>
        <div className="mt-4 border-t border-hairline/50 pt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">Completed scans</span>
          <span className="text-accent-twilight font-mono">{successfulScans}</span>
        </div>
      </div>
    </div>
  )
}
