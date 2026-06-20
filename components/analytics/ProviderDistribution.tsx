"use client"

import { PieChart, Pie, Cell } from "recharts"
import { PieChartIcon } from "lucide-react"
import type { ApiKeyDiscovery } from "@/lib/actions/discoveries"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartConfig = {
  openai: {
    label: "OpenAI",
    color: "#ff7a17",
  },
  anthropic: {
    label: "Anthropic",
    color: "#7c3aed",
  },
  cohere: {
    label: "Cohere",
    color: "#c4b5fd",
  },
  midjourney: {
    label: "Midjourney",
    color: "#a0c3ec",
  },
  other: {
    label: "Other",
    color: "#ffffff",
  },
} satisfies ChartConfig

export default function ProviderDistribution({ keys }: { keys: ApiKeyDiscovery[] }) {
  // Process data for chart
  const processData = () => {
    const providerCounts: Record<string, number> = {}

    keys.forEach((key) => {
      const prov = key.provider || "Other"
      providerCounts[prov] = (providerCounts[prov] || 0) + 1
    })

    return Object.entries(providerCounts).map(([name, value]) => {
      const key = name.toLowerCase()
      const hasConfig = key in chartConfig
      const fill = hasConfig ? `var(--color-${key})` : "var(--color-other)"
      return { name, value, fill }
    })
  }

  const chartData = processData()

  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-5 font-sans">
      <div className="mb-6 flex items-center space-x-2">
        <PieChartIcon className="h-4 w-4 text-white" />
        <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">Provider Distribution</h2>
      </div>

      <div className="h-64 flex items-center justify-center">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="#191919" strokeWidth={2} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => [`${value} keys`, "Count"]} />}
              />
              <ChartLegend 
                content={<ChartLegendContent className="font-mono text-[10px] uppercase text-gray-400 tracking-wider" />}
              />
            </PieChart>
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
