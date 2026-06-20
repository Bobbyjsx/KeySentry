"use client"

import { useGetScanHistory } from "@/hooks/data/useScan/useScan"
import type { ScanHistoryRecord } from "@/lib/actions/scan"
import { Clock, Database, Shield, ShieldAlert, Loader2 } from "lucide-react"

export default function ScanHistoryList({ initialScans }: { initialScans: ScanHistoryRecord[] }) {
  const { data: scans, isLoading } = useGetScanHistory(initialScans)

  const activeScans = scans || initialScans

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded-full bg-green-900 px-2.5 py-1 text-xs font-semibold text-green-300">Completed</span>
      case "in_progress":
        return (
          <span className="flex items-center space-x-1 rounded-full bg-indigo-900 px-2.5 py-1 text-xs font-semibold text-indigo-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Scanning...</span>
          </span>
        )
      case "failed":
        return <span className="rounded-full bg-red-900 px-2.5 py-1 text-xs font-semibold text-red-300">Failed</span>
      default:
        return <span className="rounded-full bg-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-300">{status}</span>
    }
  }

  if (isLoading && !activeScans) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!activeScans || activeScans.length === 0) {
    return null // Don't show anything if there is no scan history
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Scans</h2>
        <p className="mt-1 text-sm text-gray-400">View logs and results of your previous key scans.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Scan Date & Time
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Sources
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Duration
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Keys Found
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {activeScans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-750 transition-colors">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                  {formatDate(scan.scanDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {getStatusBadge(scan.status)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center space-x-1.5">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span>{scan.sourcesScanned} source(s)</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{scan.durationSeconds}s</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {scan.keysFound > 0 ? (
                    <div className="flex items-center space-x-1 text-red-400 font-semibold">
                      <ShieldAlert className="h-4 w-4" />
                      <span>{scan.keysFound} key(s) found</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-green-400">
                      <Shield className="h-4 w-4" />
                      <span>Clean (0 found)</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
