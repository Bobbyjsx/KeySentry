import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAlertsAction, markAlertAsReadAction, type Alert } from "@/lib/actions/alerts"

export function useGetAlerts(initialData?: Alert[]) {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: getAlertsAction,
    initialData,
    staleTime: 10 * 1000, // 10 seconds stale time
  })
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markAlertAsReadAction(id),
    onSuccess: (updatedAlert) => {
      // Optimistically update the cache
      queryClient.setQueryData<Alert[]>(["alerts"], (oldAlerts) => {
        if (!oldAlerts) return [updatedAlert]
        return oldAlerts.map((alert) => (alert.id === updatedAlert.id ? updatedAlert : alert))
      })
    },
  })
}
