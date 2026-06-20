"use client"

import { useGetAnalytics } from "@/hooks/data/useAnalytics/useAnalytics"
import type { AnalyticsData } from "@/lib/actions/analytics"
import AnalyticsOverview from "./AnalyticsOverview"
import DiscoveryTrends from "./DiscoveryTrends"
import ProviderDistribution from "./ProviderDistribution"
import RiskAssessment from "./RiskAssessment"
import { Loader2 } from "lucide-react"

export default function AnalyticsDashboard({ initialData }: { initialData: AnalyticsData }) {
  const { data, isLoading } = useGetAnalytics(initialData)

  const analyticsData = data || initialData

  if (isLoading && !analyticsData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalyticsOverview keys={analyticsData.keys} scanHistory={analyticsData.scanHistory} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DiscoveryTrends scanHistory={analyticsData.scanHistory} />
        <ProviderDistribution keys={analyticsData.keys} />
      </div>

      <RiskAssessment keys={analyticsData.keys} />
    </div>
  )
}
