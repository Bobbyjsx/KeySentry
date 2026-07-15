"use client"

import { useGetScanDetails, useStartScan } from "@/hooks/data/useScan/useScan"
import type { ScanDetails } from "@/lib/actions/scan"
import { Database, Shield, Loader2, ChevronLeft, Copy, Check, ExternalLink, AlertTriangle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { formatDateTime, formatDuration } from "@/lib/date"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { isServerError, notifyServerError } from "@/lib/server-error"

export default function ScanDetailsView({
  scanId,
}: {
  scanId: string
}) {
  const { data: details, isLoading } = useGetScanDetails(scanId)
  const replayMutation = useStartScan()
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (details && isServerError(details)) {
      notifyServerError(details)
    }
  }, [details])

  const safeDetails = (!details || isServerError(details)) ? null : details
  const activeDetails = safeDetails
  
  const [liveDuration, setLiveDuration] = useState<number>(0)

  useEffect(() => {
    if (activeDetails?.scan?.durationSeconds !== undefined) {
      setLiveDuration(activeDetails.scan.durationSeconds)
    }
  }, [activeDetails?.scan?.durationSeconds])

  useEffect(() => {
    if (!activeDetails?.scan) return
    const isScanning = activeDetails.scan.status === "in_progress" || activeDetails.scan.status === "pending"
    if (!isScanning) return

    const getElapsed = () => {
      let dateStr = activeDetails.scan.scanDate
      if (dateStr && !dateStr.endsWith("Z") && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
        dateStr += "Z"
      }
      const start = new Date(dateStr).getTime()
      return Math.max(0, Math.floor((Date.now() - start) / 1000))
    }

    setLiveDuration(getElapsed())

    const interval = setInterval(() => {
      setLiveDuration(getElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [activeDetails?.scan?.status, activeDetails?.scan?.scanDate])

  if (!activeDetails) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-hairline bg-canvas-card p-6">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    )
  }
  const { scan, keys } = activeDetails

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("API key hash copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleReplayScan = () => {
    if (!scan.trigger) return
    toast.info("Replaying scan configuration...")
    replayMutation.mutate(
      { target: scan.trigger },
      {
        onSuccess: (data) => {
          if (isServerError(data)) {
            notifyServerError(data)
            return
          }
          toast.success("Scan replayed in the background! Redirecting...")
          const scanUrl = `/scan/${data.scanId}`
          router.push(scanUrl)
          setTimeout(() => {
            if (window.location.pathname !== scanUrl) {
              window.location.href = scanUrl
            }
          }, 500)
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to replay scan")
        },
      }
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded-pill border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-mono uppercase text-green-400">Completed</span>
      case "in_progress":
      case "pending":
        return (
          <span className="flex items-center space-x-1.5 rounded-pill border border-accent-twilight/20 bg-accent-twilight/10 px-3 py-1 text-xs font-mono uppercase text-accent-twilight">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Scanning</span>
          </span>
        )
      case "failed":
        return <span className="rounded-pill border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-mono uppercase text-red-400">Failed</span>
      default:
        return <span className="rounded-pill border border-hairline bg-canvas-soft px-3 py-1 text-xs font-mono uppercase text-gray-400">{status}</span>
    }
  }

  if (isLoading && !activeDetails) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-hairline bg-canvas-card p-6">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2">
        <Link
          href="/scan"
          className="flex items-center text-caption-mono-sm font-mono uppercase text-gray-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Scans
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-display-sm font-normal text-white tracking-display-sm">Scan Session Details</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-mono-sm font-mono uppercase text-gray-500">
            <span>ID: {scan.id}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              Trigger:{" "}
              {scan.triggerLink ? (
                <a
                  href={scan.triggerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-breeze hover:text-white underline transition-colors inline-flex items-center"
                >
                  {scan.trigger}
                  <ExternalLink className="h-3 w-3 ml-0.5 text-accent-breeze" />
                </a>
              ) : (
                <span className="text-white">{scan.trigger}</span>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {scan.status !== "in_progress" && scan.status !== "pending" && (
            <button
              onClick={handleReplayScan}
              disabled={replayMutation.isPending}
              className="flex items-center space-x-1.5 rounded-pill border border-hairline bg-canvas hover:bg-canvas-soft px-4 py-1.5 font-mono text-xs uppercase text-white disabled:opacity-50 transition-colors"
            >
              {replayMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              <span>Replay Scan</span>
            </button>
          )}
          {getStatusBadge(scan.status)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Date Run */}
        <div className="bg-canvas-card border border-hairline p-5 rounded-sm">
          <div className="text-caption-mono-sm font-mono uppercase text-gray-500 whitespace-nowrap">Scan Date</div>
          <div className="mt-2 text-body-sm font-mono uppercase text-white truncate">
            {formatDateTime(scan.scanDate)}
          </div>
        </div>

        {/* Sources Count */}
        <div className="bg-canvas-card border border-hairline p-5 rounded-sm">
          <div className="text-caption-mono-sm font-mono uppercase text-gray-500 whitespace-nowrap">Sources Scanned</div>
          <div className="mt-2 flex items-baseline space-x-1 whitespace-nowrap">
            <span className="text-display-xs font-normal text-white tracking-display-sm">{scan.sourcesScanned}</span>{" "}
            <span className="text-xs text-gray-500 font-mono uppercase">target(s)</span>
          </div>
        </div>

        {/* Repos Scanned */}
        <div className="bg-canvas-card border border-hairline p-5 rounded-sm">
          <div className="text-caption-mono-sm font-mono uppercase text-gray-500 whitespace-nowrap">Repositories</div>
          <div className="mt-2 flex items-baseline space-x-1 whitespace-nowrap">
            <span className="text-display-xs font-normal text-white tracking-display-sm">{scan.reposScanned ?? 0}</span>{" "}
            <span className="text-xs text-gray-500 font-mono uppercase">repo(s)</span>
          </div>
        </div>

        {/* Files Scanned */}
        <div className="bg-canvas-card border border-hairline p-5 rounded-sm">
          <div className="text-caption-mono-sm font-mono uppercase text-gray-500 whitespace-nowrap">Files Scanned</div>
          <div className="mt-2 flex items-baseline space-x-1 whitespace-nowrap">
            <span className="text-display-xs font-normal text-white tracking-display-sm">{scan.filesScanned ?? 0}</span>{" "}
            <span className="text-xs text-gray-500 font-mono uppercase">file(s)</span>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-canvas-card border border-hairline p-5 rounded-sm">
          <div className="text-caption-mono-sm font-mono uppercase text-gray-500 whitespace-nowrap">Duration</div>
          <div className="mt-2 flex items-baseline space-x-1 whitespace-nowrap">
            <span className="text-display-xs font-normal text-white tracking-display-sm">{formatDuration(liveDuration)}</span>{" "}
            <span className="text-xs text-gray-500 font-mono uppercase">sec(s)</span>
          </div>
        </div>

        {/* Keys Found */}
        <div className="bg-canvas-card border border-hairline p-5 rounded-sm">
          <div className="text-caption-mono-sm font-mono uppercase text-gray-500 whitespace-nowrap">Keys Discovered</div>
          <div className="mt-2 flex items-baseline space-x-1 whitespace-nowrap">
            <span className={`text-display-xs font-normal tracking-display-sm ${scan.keysFound > 0 ? "text-accent-sunset animate-pulse" : "text-green-400"}`}>
              {scan.keysFound}
            </span>{" "}
            <span className="text-xs text-gray-500 font-mono uppercase">exposed</span>
          </div>
        </div>
      </div>

      {/* Scan Scope */}
      <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
        <h2 className="text-caption-mono font-mono uppercase text-white mb-4 tracking-caption-mono">Scan Scope</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scan.sources && scan.sources.length > 0 ? (
            scan.sources.map((src: any, index: number) => {
              const isRepo = src.value.includes("/")
              return (
                <div key={index} className="flex items-center space-x-3 rounded-sm border border-hairline bg-canvas-soft p-4">
                  <Database className="h-4 w-4 text-accent-breeze flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-caption-mono-sm font-mono uppercase text-gray-500">
                      {isRepo ? "GitHub Repository" : "GitHub Account / Organization"}
                    </p>
                    <p className="mt-1 text-sm font-mono text-white truncate">
                      {src.value}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-2 text-sm text-gray-500 py-2">
              No sources configured for this scan session.
            </div>
          )}
        </div>
      </div>

      {/* Discovered Keys Table Section */}
      <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
        <h2 className="text-caption-mono font-mono uppercase text-white mb-4 tracking-caption-mono">Keys Discovered In This Scan</h2>

        {scan.status === "in_progress" || scan.status === "pending" ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent-breeze mb-4" />
            <h3 className="text-display-xs font-normal text-white mb-1">Scan in Progress</h3>
            <p className="max-w-md text-body-sm text-gray-400">
              Please wait while we thoroughly inspect the target repositories for exposed credentials. This might take a few minutes.
            </p>
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-pill border border-hairline bg-canvas-soft text-green-400 mb-4 animate-pulse">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-display-xs font-normal text-white mb-1">Clean Scan Results</h3>
            <p className="max-w-md text-body-sm text-gray-400">
              No exposed credentials or API keys were detected in the target sources during this scan.
            </p>
          </div>
        ) : (
          <div className="rounded-sm border border-hairline overflow-hidden">
            <Table>
              <TableHeader className="bg-canvas-soft">
                <TableRow className="border-b border-hairline hover:bg-transparent">
                  <TableHead className="text-caption-mono-sm font-mono uppercase text-gray-500 h-10 px-4">
                    API Key Hash
                  </TableHead>
                  <TableHead className="text-caption-mono-sm font-mono uppercase text-gray-500 h-10 px-4">
                    Provider
                  </TableHead>
                  <TableHead className="text-caption-mono-sm font-mono uppercase text-gray-500 h-10 px-4">
                    Repository
                  </TableHead>
                  <TableHead className="text-caption-mono-sm font-mono uppercase text-gray-500 h-10 px-4">
                    Risk Level
                  </TableHead>
                  <TableHead className="text-caption-mono-sm font-mono uppercase text-gray-500 h-10 px-4">
                    Status
                  </TableHead>
                  <TableHead className="text-caption-mono-sm font-mono uppercase text-gray-500 h-10 px-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key: any) => (
                  <TableRow key={key.id} className="border-b border-hairline hover:bg-canvas-soft/20 transition-colors">
                    <TableCell className="px-4 py-3 text-body-sm font-mono text-white whitespace-nowrap">
                      {key.keyHash}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-pill border border-accent-twilight/20 bg-accent-twilight/10 px-2 py-0.5 text-xs font-mono uppercase text-accent-twilight">
                        {key.provider}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-gray-400 font-mono whitespace-nowrap">
                      {key.repository || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-pill border border-accent-sunset/20 bg-accent-sunset/10 px-2.5 py-0.5 text-xs font-mono uppercase text-accent-sunset">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>High Risk</span>
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded-pill px-2.5 py-0.5 text-xs font-mono uppercase ${
                        key.status === "active"
                          ? "border border-green-500/20 bg-green-500/10 text-green-400"
                          : "border border-hairline bg-canvas-soft text-gray-400"
                      }`}>
                        {key.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => copyToClipboard(key.keyHash, key.id)}
                          className="rounded-pill p-1.5 text-gray-400 hover:bg-canvas-soft hover:text-white border border-transparent hover:border-hairline transition-all"
                          title="Copy Key Hash"
                        >
                          {copiedId === key.id ? (
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {key.link && (
                          <a
                            href={key.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-pill p-1.5 text-gray-400 hover:bg-canvas-soft hover:text-white border border-transparent hover:border-hairline transition-all inline-flex"
                            title="View Source Link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
