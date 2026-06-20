"use client"

import { useGetScanDetails } from "@/hooks/data/useScan/useScan"
import type { ScanDetails } from "@/lib/actions/scan"
import { Clock, Database, Shield, ShieldAlert, Loader2, ChevronLeft, Copy, Check, ExternalLink, AlertTriangle } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"
import { toast } from "sonner"

export default function ScanDetailsView({
  scanId,
  initialData,
}: {
  scanId: string
  initialData: ScanDetails
}) {
  const { data: details, isLoading } = useGetScanDetails(scanId, initialData)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeDetails = details || initialData
  const { scan, keys } = activeDetails

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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("API key hash copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded-full bg-green-900 px-3 py-1.5 text-xs font-semibold text-green-300">Completed</span>
      case "in_progress":
        return (
          <span className="flex items-center space-x-1.5 rounded-full bg-indigo-900 px-3 py-1.5 text-xs font-semibold text-indigo-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Scanning...</span>
          </span>
        )
      case "failed":
        return <span className="rounded-full bg-red-900 px-3 py-1.5 text-xs font-semibold text-red-300">Failed</span>
      default:
        return <span className="rounded-full bg-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-300">{status}</span>
    }
  }

  if (isLoading && !activeDetails) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Link
          href="/scan"
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Scans
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Scan Session Details</h1>
          <p className="mt-1 text-sm text-gray-400 font-mono text-xs">ID: {scan.id}</p>
        </div>
        <div>
          {getStatusBadge(scan.status)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Date Run */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-400">Scan Date</div>
          <div className="mt-2 text-base font-semibold text-white truncate">
            {formatDate(scan.scanDate)}
          </div>
        </div>

        {/* Sources Count */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-400">Sources Scanned</div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{scan.sourcesScanned}</span>
            <span className="text-sm text-gray-400">target(s)</span>
          </div>
        </div>

        {/* Duration */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-400">Duration</div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{scan.durationSeconds}</span>
            <span className="text-sm text-gray-400">second(s)</span>
          </div>
        </div>

        {/* Keys Found */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-400">Keys Discovered</div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${scan.keysFound > 0 ? "text-red-400 animate-pulse" : "text-green-400"}`}>
              {scan.keysFound}
            </span>
            <span className="text-sm text-gray-400">exposed keys</span>
          </div>
        </div>
      </div>

      {/* Discovered Keys Table Section */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-md">
        <h2 className="text-lg font-bold text-white mb-4">Keys Discovered In This Scan</h2>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30 text-green-400 border border-green-500/25 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Clean Scan Results</h3>
            <p className="max-w-md text-sm text-gray-400">
              No exposed credentials or API keys were detected in the target sources during this scan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    API Key Hash
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Provider
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Repository
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Risk Level
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-750 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-300">
                      {key.keyHash}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="rounded-full bg-indigo-900/40 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                        {key.provider}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400">
                      {key.repository || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-950 text-red-400 border border-red-500/20`}>
                        <AlertTriangle className="h-3 w-3 mr-0.5" />
                        <span>High Risk</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        key.status === "active"
                          ? "bg-green-950 text-green-400 border border-green-500/20"
                          : "bg-gray-750 text-gray-400 border border-gray-600/20"
                      } border`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => copyToClipboard(key.keyHash, key.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                          title="Copy Key Hash"
                        >
                          {copiedId === key.id ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        {key.link && (
                          <a
                            href={key.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                            title="View Source Link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
