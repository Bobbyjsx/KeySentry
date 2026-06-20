import { useMutation, useQueryClient } from "@tanstack/react-query"
import { startScanAction, type ScanResult } from "@/lib/actions/scan"
import type { ScanSource } from "@/lib/core/scan-manager"

export function useStartScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sources, scanDepth }: { sources: ScanSource[]; scanDepth: "shallow" | "deep" }) =>
      startScanAction(sources, scanDepth),
    onSuccess: () => {
      // Invalidate queries so dashboard, discoveries, and alerts fetch latest data
      queryClient.invalidateQueries({ queryKey: ["discoveries"] })
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}
