import { useQuery } from "@tanstack/react-query"
import { getAnalyticsDataAction, type AnalyticsData } from "@/lib/actions/analytics"

export function useGetAnalytics(initialData?: AnalyticsData) {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalyticsDataAction,
    initialData,
    staleTime: 30 * 1000, // 30 seconds stale time
  })
}
