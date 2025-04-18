"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar } from "lucide-react"
import type { Database } from "@/types/supabase"

type ScanHistory = Database["public"]["Tables"]["scan_history"]["Row"]

export default function DiscoveryTrends({ scanHistory }: { scanHistory: ScanHistory[] }) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days")

  // Process data for chart
  const processData = () => {
    // Sort by date
    const sortedHistory = [...scanHistory].sort(
      (a, b) => new Date(a.scan_date).getTime() - new Date(b.scan_date).getTime(),
    )

    // Group by date
    const groupedData: Record<string, { date: string; keys: number; sources: number }> = {}

    sortedHistory.forEach((scan) => {
      const date = new Date(scan.scan_date).toISOString().split("T")[0]

      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          keys: 0,
          sources: 0,
        }
      }

      groupedData[date].keys += scan.keys_found
      groupedData[date].sources += scan.sources_scanned
    })

    // Convert to array
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
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Discovery Trends</h2>
        </div>

        <div className="flex space-x-1 rounded-md bg-gray-700 p-1">
          <button
            onClick={() => setTimeRange("7days")}
            className={`rounded px-2 py-1 text-xs ${
              timeRange === "7days" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange("30days")}
            className={`rounded px-2 py-1 text-xs ${
              timeRange === "30days" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeRange("90days")}
            className={`rounded px-2 py-1 text-xs ${
              timeRange === "90days" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            90D
          </button>
        </div>
      </div>

      <div className="h-64">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tickFormatter={(date) => {
                  const d = new Date(date)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "#F9FAFB",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="keys" name="API Keys" stroke="#818CF8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="sources" name="Sources" stroke="#34D399" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">No data available for the selected time range</p>
          </div>
        )}
      </div>
    </div>
  )
}
