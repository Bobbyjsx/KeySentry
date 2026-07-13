import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getSettings, saveSettingsAction, type UserSettings } from "@/lib/actions/settings"

export function useGetSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      const result = await saveSettingsAction(settings)
      if (!result.success) {
        throw new Error(result.error || "Failed to save settings")
      }
      return result.data!
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data)
    },
  })
}
