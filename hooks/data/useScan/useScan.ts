import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { startScanAction, getScanHistoryAction, type ScanResult, type ScanHistoryRecord } from "@/lib/actions/scan"
import type { ScanSource } from "@/lib/core/scan-manager"

export function useStartScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sources, scanDepth }: { sources: ScanSource[]; scanDepth: "shallow" | "deep" }) =>
      startScanAction(sources, scanDepth),
    onSuccess: () => {
      // Invalidate queries so dashboard, discoveries, alerts, and scan history fetch latest data
      queryClient.invalidateQueries({ queryKey: ["discoveries"] })
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      queryClient.invalidateQueries({ queryKey: ["scanHistory"] })
    },
  })
}

export function useGetScanHistory(initialData?: ScanHistoryRecord[]) {
  return useQuery({
    queryKey: ["scanHistory"],
    queryFn: getScanHistoryAction,
    initialData,
    staleTime: 15 * 1000, // 15 seconds stale cache
  })
}
