import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getDiscoveriesAction,
  archiveDiscoveryAction,
  deleteDiscoveryAction,
  type ApiKeyDiscovery,
} from "@/lib/actions/discoveries"

export function useGetDiscoveries(keyId?: string) {
  return useQuery({
    queryKey: ["discoveries", keyId || "all"],
    queryFn: () => getDiscoveriesAction(keyId),
    staleTime: 15 * 1000, // 15 seconds stale time
  })
}

export function useArchiveDiscovery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveDiscoveryAction(id),
    onSuccess: (archivedKey) => {
      // Refresh the query caches
      queryClient.invalidateQueries({ queryKey: ["discoveries"] })
    },
  })
}

export function useDeleteDiscovery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDiscoveryAction(id),
    onSuccess: (_, deletedId) => {
      // Refresh query caches
      queryClient.invalidateQueries({ queryKey: ["discoveries"] })
    },
  })
}
