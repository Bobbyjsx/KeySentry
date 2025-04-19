"use client"

import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/supabase"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { AlertCircle, AlertTriangle, Bell, Clock, ExternalLink, Info } from "lucide-react"
import { useState } from "react"

type Alert = Database["public"]["Tables"]["alerts"]["Row"]

export default function AlertsList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const { toast } = useToast()

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("alerts").update({ is_read: true }).eq("id", id).eq("user_id", user?.id)

      if (error) throw error

      setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, is_read: true } : alert)))

      toast({
        title: "Alert updated",
        description: "Alert marked as read",
        variant: "success",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update alert",
        variant: "destructive",
      })
    }
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

  if (alerts.length === 0) {
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
            alert.is_read ? "border-gray-700 bg-gray-800" : "border-indigo-900 bg-gray-800"
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
                    {formatDate(alert.created_at)}
                  </span>
                  {alert.api_key_id && (
                    <a
                      href={`/discoveries?key=${alert.api_key_id}`}
                      className="flex items-center text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View Key
                    </a>
                  )}
                </div>
              </div>
            </div>
            {!alert.is_read && (
              <button
                onClick={() => markAsRead(alert.id)}
                className="rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
