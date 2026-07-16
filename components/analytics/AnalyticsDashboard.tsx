"use client"

import { useGetAnalytics } from "@/hooks/data/useAnalytics/useAnalytics"
import type { AnalyticsData } from "@/lib/actions/analytics"
import AnalyticsOverview from "./AnalyticsOverview"
import DiscoveryTrends from "./DiscoveryTrends"
import ProviderDistribution from "./ProviderDistribution"
import RiskAssessment from "./RiskAssessment"
import { Loader2 } from "lucide-react"
import { isServerError, notifyServerError } from "@/lib/server-error"
import { useEffect } from "react"

export default function AnalyticsDashboard() {
  const { data: analyticsData, isLoading } = useGetAnalytics()

  useEffect(() => {
    if (analyticsData && isServerError(analyticsData)) {
      notifyServerError(analyticsData)
    }
  }, [analyticsData])

  const safeData = (!analyticsData || isServerError(analyticsData)) ? null : analyticsData

  if (isLoading || !safeData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalyticsOverview keys={safeData.keys} scanHistory={safeData.scanHistory} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DiscoveryTrends scanHistory={safeData.scanHistory} />
        <ProviderDistribution keys={safeData.keys} />
      </div>

      <RiskAssessment keys={safeData.keys} />
    </div>
  )
}
