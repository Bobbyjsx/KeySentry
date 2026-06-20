"use client"

import { useGetScanHistory } from "@/hooks/data/useScan/useScan"
import type { ScanHistoryRecord } from "@/lib/actions/scan"
import { Clock, Database, Shield, ShieldAlert, Loader2, Plus, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ScanHistoryList({ initialScans }: { initialScans: ScanHistoryRecord[] }) {
  const { data: scans, isLoading } = useGetScanHistory(initialScans)
  const router = useRouter()

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
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-16 text-center max-w-2xl mx-auto my-12 shadow-xl">
        <div className="relative mb-6">
          <div className="absolute inset-0 -m-4 animate-pulse rounded-full bg-indigo-500/10 blur-xl"></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-900/30 text-indigo-400 border border-indigo-500/30">
            <Shield className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Scans Found</h2>
        <p className="max-w-md text-gray-400 mb-8 leading-relaxed">
          You haven't run any key scans yet. Configure your scan sources to start monitoring your repositories and pastebins for exposed secrets.
        </p>
        <Link
          href="/scan/new"
          className="flex items-center space-x-2 rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 transition-all hover:scale-[1.02] shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5" />
          <span>Configure & Start Your First Scan</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-white">Scan History</h2>
          <p className="mt-1 text-sm text-gray-400">View log history and findings of all key scan sessions.</p>
        </div>
        <Link
          href="/scan/new"
          className="mt-4 sm:mt-0 flex items-center justify-center space-x-2 rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4" />
          <span>New Scan</span>
        </Link>
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
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {activeScans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-750 transition-colors">
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-300 font-medium">
                  {formatDate(scan.scanDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm">
                  {getStatusBadge(scan.status)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-300">
                  <div className="flex items-center space-x-1.5">
                    <Database className="h-4 w-4 text-gray-500" />
                    <span>{scan.sourcesScanned} source(s)</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-300">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{scan.durationSeconds}s</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm">
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
                <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm">
                  <Link
                    href={`/scan/${scan.id}`}
                    className="inline-flex items-center space-x-1.5 rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-gray-600 hover:text-white transition-all shadow-sm"
                  >
                    <span>Details</span>
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
