import { useExponentialPolling } from "@/hooks/utils/useExponentialPolling"
import { getScanDetailsAction, getScanHistoryAction, startScanAction, type ScanDetails, type ScanHistoryRecord } from "@/lib/actions/scan"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useStartScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ target }: { target: string }) => startScanAction(target),
    onSuccess: () => {
      // Invalidate queries so dashboard, discoveries, alerts, and scan history fetch latest data
      queryClient.invalidateQueries({ queryKey: ["discoveries"] })
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      queryClient.invalidateQueries({ queryKey: ["scanHistory"] })
    },
  })
}

export function useGetScanHistory() {
  const getRefetchInterval = useExponentialPolling<ScanHistoryRecord[]>((data) => {
    if (!data || !Array.isArray(data)) return false
    return data.some((scan) => scan.status === "in_progress" || scan.status === "pending")
  })

  return useQuery({
    queryKey: ["scans", "history"],
    queryFn: getScanHistoryAction,
    refetchInterval: getRefetchInterval,
  })
}

export function useGetScanDetails(scanId: string, initialData?: ScanDetails) {
  return useQuery({
    queryKey: ["scanDetails", scanId],
    queryFn: () => getScanDetailsAction(scanId),
    initialData,
    staleTime: 5000, // 5 seconds stale cache for details
    refetchInterval: useExponentialPolling<ScanDetails>((data) => {
      return data?.scan?.status === "in_progress" || data?.scan?.status === "pending"
    }),
  })
}
