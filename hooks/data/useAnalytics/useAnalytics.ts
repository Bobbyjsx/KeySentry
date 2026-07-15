import { useQuery } from "@tanstack/react-query"
import { getAnalyticsDataAction, type AnalyticsData } from "@/lib/actions/analytics"

export function useGetAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalyticsDataAction,
    staleTime: 30 * 1000, // 30 seconds stale time
  })
}
