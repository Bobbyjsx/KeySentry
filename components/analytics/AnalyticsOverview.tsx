"use client"

import { BarChart, Database, AlertTriangle, Shield } from "lucide-react"
import type { Database as DatabaseType } from "@/types/supabase"

type ApiKey = DatabaseType["public"]["Tables"]["api_keys"]["Row"]
type ScanHistory = DatabaseType["public"]["Tables"]["scan_history"]["Row"]

export default function AnalyticsOverview({
  keys,
  scanHistory,
}: {
  keys: ApiKey[]
  scanHistory: ScanHistory[]
}) {
  // Calculate statistics
  const totalKeys = keys.length
  const activeKeys = keys.filter((key) => key.status === "active").length
  const highRiskKeys = keys.filter((key) => key.risk_level === "high").length
  const providers = new Set(keys.map((key) => key.provider)).size

  // Calculate scan statistics
  const totalScans = scanHistory.length
  const successfulScans = scanHistory.filter((scan) => scan.status === "completed").length
  const averageKeysPerScan =
    totalScans > 0 ? Math.round(scanHistory.reduce((sum, scan) => sum + scan.keys_found, 0) / totalScans) : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-gray-700 bg-gradient-to-br from-indigo-900 to-indigo-800 p-4 shadow-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-300">Total Discoveries</p>
            <p className="text-2xl font-bold text-white">{totalKeys}</p>
          </div>
          <div className="rounded-lg bg-indigo-800 p-2">
            <Database className="h-6 w-6 text-indigo-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-indigo-300">
            <span className="text-green-400">+{averageKeysPerScan}</span> avg. per scan
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-red-700 bg-gradient-to-br from-red-900 to-red-800 p-4 shadow-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-red-300">High Risk Keys</p>
            <p className="text-2xl font-bold text-white">{highRiskKeys}</p>
          </div>
          <div className="rounded-lg bg-red-800 p-2">
            <AlertTriangle className="h-6 w-6 text-red-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-red-300">
            <span className="text-red-400">{Math.round((highRiskKeys / totalKeys) * 100) || 0}%</span> of total keys
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-green-700 bg-gradient-to-br from-green-900 to-green-800 p-4 shadow-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-green-300">Active Keys</p>
            <p className="text-2xl font-bold text-white">{activeKeys}</p>
          </div>
          <div className="rounded-lg bg-green-800 p-2">
            <Shield className="h-6 w-6 text-green-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-green-300">
            <span className="text-green-400">{Math.round((activeKeys / totalKeys) * 100) || 0}%</span> of total keys
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-purple-700 bg-gradient-to-br from-purple-900 to-purple-800 p-4 shadow-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-purple-300">Providers</p>
            <p className="text-2xl font-bold text-white">{providers}</p>
          </div>
          <div className="rounded-lg bg-purple-800 p-2">
            <BarChart className="h-6 w-6 text-purple-300" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-purple-300">
            <span className="text-purple-400">{successfulScans}</span> successful scans
          </p>
        </div>
      </div>
    </div>
  )
}
