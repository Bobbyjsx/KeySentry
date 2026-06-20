"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ShieldAlert } from "lucide-react"
import type { ApiKeyDiscovery } from "@/lib/actions/discoveries"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartConfig = {
  high: {
    label: "High Risk",
    color: "#ff7a17",
  },
  medium: {
    label: "Medium Risk",
    color: "#c4b5fd",
  },
  low: {
    label: "Low Risk",
    color: "#a0c3ec",
  },
} satisfies ChartConfig

export default function RiskAssessment({ keys }: { keys: ApiKeyDiscovery[] }) {
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

      providerRisks[key.provider][key.riskLevel as "high" | "medium" | "low"]++
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

      statusRisks[key.status][key.riskLevel as "high" | "medium" | "low"]++
    })

    return Object.values(statusRisks)
  }

  const providerData = processProviderData()
  const statusData = processStatusData()

  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-5 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-white" />
          <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">Risk Assessment</h2>
        </div>

        <div className="flex space-x-1.5 rounded-pill border border-hairline bg-canvas-soft p-1">
          <button
            onClick={() => setView("provider")}
            className={`rounded-pill px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              view === "provider" ? "bg-white text-canvas font-normal" : "text-gray-400 hover:text-white"
            }`}
          >
            By Provider
          </button>
          <button
            onClick={() => setView("status")}
            className={`rounded-pill px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              view === "status" ? "bg-white text-canvas font-normal" : "text-gray-400 hover:text-white"
            }`}
          >
            By Status
          </button>
        </div>
      </div>

      <div className="h-80 flex items-center justify-center">
        {(view === "provider" ? providerData : statusData).length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={view === "provider" ? providerData : statusData}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#212327" />
              <XAxis 
                dataKey={view === "provider" ? "provider" : "status"} 
                stroke="#7d8187"
                tick={{ fill: "#7d8187", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <YAxis 
                stroke="#7d8187"
                tick={{ fill: "#7d8187", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend 
                content={<ChartLegendContent className="font-mono text-[10px] uppercase text-gray-400 tracking-wider pt-4" />}
              />
              <Bar dataKey="high" name="High Risk" stackId="a" fill="var(--color-high)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" name="Medium Risk" stackId="a" fill="var(--color-medium)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="low" name="Low Risk" stackId="a" fill="var(--color-low)" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm font-mono uppercase tracking-wider text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
