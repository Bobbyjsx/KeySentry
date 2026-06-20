"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Calendar } from "lucide-react"
import type { ScanHistoryAnalytics } from "@/lib/actions/analytics"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartConfig = {
  keys: {
    label: "API Keys",
    color: "#ffffff",
  },
  sources: {
    label: "Sources",
    color: "#a0c3ec",
  },
} satisfies ChartConfig

export default function DiscoveryTrends({ scanHistory }: { scanHistory: ScanHistoryAnalytics[] }) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days")

  // Process data for chart
  const processData = () => {
    const sortedHistory = [...scanHistory].sort(
      (a, b) => new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime()
    )

    const groupedData: Record<string, { date: string; keys: number; sources: number }> = {}

    sortedHistory.forEach((scan) => {
      const date = new Date(scan.scanDate).toISOString().split("T")[0]

      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          keys: 0,
          sources: 0,
        }
      }

      groupedData[date].keys += scan.keysFound
      groupedData[date].sources += scan.sourcesScanned
    })

    return Object.values(groupedData)
  }

  const chartData = processData()

  // Filter data based on time range
  const filterDataByTimeRange = () => {
    const now = new Date()
    let daysToSubtract = 30

    if (timeRange === "7days") daysToSubtract = 7
    else if (timeRange === "90days") daysToSubtract = 90

    const cutoffDate = new Date(now)
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract)

    return chartData.filter((item) => new Date(item.date) >= cutoffDate)
  }

  const filteredData = filterDataByTimeRange()

  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-5 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-white" />
          <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">Discovery Trends</h2>
        </div>

        <div className="flex space-x-1.5 rounded-pill border border-hairline bg-canvas-soft p-1">
          <button
            onClick={() => setTimeRange("7days")}
            className={`rounded-pill px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              timeRange === "7days" ? "bg-white text-canvas font-normal" : "text-gray-400 hover:text-white"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange("30days")}
            className={`rounded-pill px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              timeRange === "30days" ? "bg-white text-canvas font-normal" : "text-gray-400 hover:text-white"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeRange("90days")}
            className={`rounded-pill px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              timeRange === "90days" ? "bg-white text-canvas font-normal" : "text-gray-400 hover:text-white"
            }`}
          >
            90D
          </button>
        </div>
      </div>

      <div className="h-64 flex items-center justify-center">
        {filteredData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#212327" />
              <XAxis
                dataKey="date"
                stroke="#7d8187"
                tick={{ fill: "#7d8187", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis 
                stroke="#7d8187"
                tick={{ fill: "#7d8187", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent className="font-mono text-[10px] uppercase text-gray-400 tracking-wider pt-4" />} />
              <Line type="monotone" dataKey="keys" stroke="var(--color-keys)" strokeWidth={1.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="sources" stroke="var(--color-sources)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm font-mono uppercase tracking-wider text-gray-500">No data available for the selected time range</p>
          </div>
        )}
      </div>
    </div>
  )
}
