"use client"

import { useGetAlerts, useMarkAlertAsRead } from "@/hooks/data/useAlerts/useAlerts"
import type { Alert } from "@/lib/actions/alerts"
import { AlertCircle, AlertTriangle, Bell, Clock, ExternalLink, Info, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AlertsList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const { data: alerts, isLoading } = useGetAlerts(initialAlerts)
  const markAsReadMutation = useMarkAlertAsRead()

  const markAsRead = async (id: string) => {
    markAsReadMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Alert marked as read")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update alert")
      },
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "medium":
        return <Info className="h-5 w-5 text-yellow-500" />
      case "low":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  if (isLoading && !alerts) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-gray-800 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-700 p-3">
          <Bell className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-xl font-medium text-white">No alerts</h3>
        <p className="text-gray-400">You don't have any alerts at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg border ${
            alert.isRead ? "border-gray-700 bg-gray-800" : "border-indigo-900 bg-gray-800"
          } p-4 shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div>
                <h3 className="font-medium text-white">{alert.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{alert.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDate(alert.createdAt)}
                  </span>
                  {alert.apiKeyId && (
                    <a
                      href={`/discoveries?key=${alert.apiKeyId}`}
                      className="flex items-center text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View Key
                    </a>
                  )}
                </div>
              </div>
            </div>
            {!alert.isRead && (
              <button
                onClick={() => markAsRead(alert.id)}
                disabled={markAsReadMutation.isPending}
                className="rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600 disabled:opacity-50"
              >
                {markAsReadMutation.isPending && markAsReadMutation.variables === alert.id ? "Marking..." : "Mark as read"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
