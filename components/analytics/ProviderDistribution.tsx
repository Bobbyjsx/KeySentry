"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { PieChartIcon } from "lucide-react"
import type { Database } from "@/types/supabase"

type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"]

export default function ProviderDistribution({ keys }: { keys: ApiKey[] }) {
  // Process data for chart
  const processData = () => {
    const providerCounts: Record<string, number> = {}

    keys.forEach((key) => {
      if (!providerCounts[key.provider]) {
        providerCounts[key.provider] = 0
      }

      providerCounts[key.provider]++
    })

    return Object.entries(providerCounts).map(([name, value]) => ({ name, value }))
  }

  const chartData = processData()

  // Colors for different providers
  const COLORS = ["#818CF8", "#34D399", "#F87171", "#FBBF24", "#60A5FA", "#A78BFA"]

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <div className="mb-4 flex items-center space-x-2">
        <PieChartIcon className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-medium text-white">Provider Distribution</h2>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "#F9FAFB",
                }}
                formatter={(value: number) => [`${value} keys`, "Count"]}
              />
              <Legend />
            </PieChart>
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
