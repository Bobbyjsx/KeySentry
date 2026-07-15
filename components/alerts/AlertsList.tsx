"use client"

import { useGetAlerts, useMarkAlertAsRead } from "@/hooks/data/useAlerts/useAlerts"
import type { Alert } from "@/lib/actions/alerts"
import { AlertCircle, AlertTriangle, Bell, Clock, ExternalLink, Info, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatDateTime } from "@/lib/date"
import { isServerError, notifyServerError } from "@/lib/server-error"
import { useEffect } from "react"

export default function AlertsList() {
  const { data: alerts, isLoading } = useGetAlerts()
  const markAsReadMutation = useMarkAlertAsRead()

  const markAsRead = async (id: string) => {
    markAsReadMutation.mutate(id, {
      onSuccess: (res) => {
        if (isServerError(res)) {
          notifyServerError(res)
          return
        }
        toast.success("Alert marked as read")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update alert")
      },
    })
  }

  useEffect(() => {
    if (alerts && isServerError(alerts)) {
      notifyServerError(alerts)
    }
  }, [alerts])

  const safeAlerts = (!alerts || isServerError(alerts)) ? [] : alerts

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-accent-sunset" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-accent-sunset" />
      case "medium":
        return <Info className="h-4 w-4 text-accent-twilight" />
      case "low":
        return <Info className="h-4 w-4 text-accent-breeze" />
      default:
        return <Info className="h-4 w-4 text-white" />
    }
  }

  if (isLoading && !alerts) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-hairline bg-canvas-card p-6">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!safeAlerts || safeAlerts.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-sm border border-hairline bg-canvas-card p-8 text-center">
        <div className="mb-4 rounded-pill border border-hairline bg-canvas-soft p-3">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-1 font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">No alerts</h3>
        <p className="text-sm text-gray-400">You don't have any alerts at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans">
      {safeAlerts.map((alert: any) => (
        <div
          key={alert.id}
          className={`rounded-sm border ${
            alert.isRead ? "border-hairline bg-canvas-card opacity-60" : "border-white/20 bg-canvas-card"
          } p-5 transition-colors`}
        >
          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="rounded-pill border border-hairline bg-canvas-soft p-2 mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-normal text-white">{alert.title}</h3>
                  {!alert.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-sunset" title="Unread" />
                  )}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{alert.description}</p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500 font-mono">
                  <span className="flex items-center">
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    {formatDateTime(alert.createdAt)}
                  </span>
                  {alert.apiKeyId && (
                    <a
                      href={`/discoveries?key=${alert.apiKeyId}`}
                      className="flex items-center text-white hover:text-gray-300 transition-colors uppercase tracking-wider text-[10px]"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
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
                className="w-full sm:w-auto self-end sm:self-start rounded-pill border border-hairline bg-canvas px-4 py-1.5 font-mono text-[10px] uppercase text-gray-400 hover:text-white hover:border-white transition-colors disabled:opacity-50"
              >
                {markAsReadMutation.isPending && markAsReadMutation.variables === alert.id ? (
                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                ) : (
                  "Mark as read"
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
