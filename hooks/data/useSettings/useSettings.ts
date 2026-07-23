import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getSettingsAction, saveSettingsAction, type UserSettings } from "@/lib/actions/settings"
import { isServerError } from "@/lib/server-error"

export function useGetSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettingsAction,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      return await saveSettingsAction(settings)
    },
    onSuccess: (data) => {
      if (!isServerError(data)) {
        queryClient.invalidateQueries({ queryKey: ["settings"] })
      }
    },
  })
}
