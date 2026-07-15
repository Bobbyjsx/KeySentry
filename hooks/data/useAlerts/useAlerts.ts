import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getUnreadAlertsCountAction, getAlertsAction, markAlertAsReadAction, type Alert } from "@/lib/actions/alerts"

export function useGetUnreadAlertsCount() {
  return useQuery({
    queryKey: ["unreadAlertsCount"],
    queryFn: getUnreadAlertsCountAction,
    refetchInterval: 10000, // Poll every 10 seconds for new alerts/notifications
  })
}

export function useGetAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => getAlertsAction(),
    staleTime: 15 * 1000,
  })
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markAlertAsReadAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["unreadAlertsCount"] })
    },
  })
}
