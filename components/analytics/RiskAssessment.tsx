"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ShieldAlert } from "lucide-react"
import type { Database } from "@/types/supabase"

type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"]

export default function RiskAssessment({ keys }: { keys: ApiKey[] }) {
  const [view, setView] = useState<"provider" | "status">("provider")

  // Process data for provider risk chart
  const processProviderData = () => {
    const providerRisks: Record<string, { provider: string; high: number; medium: number; low: number }> = {}

    keys.forEach((key) => {
      if (!providerRisks[key.provider]) {
        providerRisks[key.provider] = {
          provider: key.provider,
          high: 0,
          medium: 0,
          low: 0,
        }
      }

      providerRisks[key.provider][key.risk_level as "high" | "medium" | "low"]++
    })

    return Object.values(providerRisks)
  }

  // Process data for status risk chart
  const processStatusData = () => {
    const statusRisks: Record<string, { status: string; high: number; medium: number; low: number }> = {}

    keys.forEach((key) => {
      if (!statusRisks[key.status]) {
        statusRisks[key.status] = {
          status: key.status,
          high: 0,
          medium: 0,
          low: 0,
        }
      }

      statusRisks[key.status][key.risk_level as "high" | "medium" | "low"]++
    })

    return Object.values(statusRisks)
  }

  const providerData = processProviderData()
  const statusData = processStatusData()

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Risk Assessment</h2>
        </div>

        <div className="flex space-x-1 rounded-md bg-gray-700 p-1">
          <button
            onClick={() => setView("provider")}
            className={`rounded px-3 py-1 text-xs ${
              view === "provider" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            By Provider
          </button>
          <button
            onClick={() => setView("status")}
            className={`rounded px-3 py-1 text-xs ${
              view === "status" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            By Status
          </button>
        </div>
      </div>

      <div className="h-80">
        {(view === "provider" ? providerData : statusData).length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={view === "provider" ? providerData : statusData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={view === "provider" ? "provider" : "status"} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "#F9FAFB",
                }}
              />
              <Legend />
              <Bar dataKey="high" name="High Risk" stackId="a" fill="#F87171" />
              <Bar dataKey="medium" name="Medium Risk" stackId="a" fill="#FBBF24" />
              <Bar dataKey="low" name="Low Risk" stackId="a" fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
