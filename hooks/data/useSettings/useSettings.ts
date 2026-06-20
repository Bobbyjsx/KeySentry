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
    mutationFn: (settings: Partial<UserSettings>) => saveSettingsAction(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data)
    },
  })
}
