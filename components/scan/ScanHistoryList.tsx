"use client"

import { useGetScanHistory } from "@/hooks/data/useScan/useScan"
import type { ScanHistoryRecord } from "@/lib/actions/scan"
import { Clock, Database, Shield, ShieldAlert, Loader2, Plus, Eye, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatDateTime, formatDuration } from "@/lib/date"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ScanHistoryList({ initialScans }: { initialScans: ScanHistoryRecord[] }) {
  const { data: scans, isLoading } = useGetScanHistory(initialScans)

  const activeScans = scans || initialScans

  const [liveDurations, setLiveDurations] = useState<Record<string, number>>({})

  useEffect(() => {
    const initial: Record<string, number> = {}
    activeScans.forEach((scan) => {
      initial[scan.id] = scan.durationSeconds
    })
    setLiveDurations(initial)
  }, [activeScans])

  useEffect(() => {
    const hasInProgress = activeScans.some((scan) => scan.status === "in_progress")
    if (!hasInProgress) return

    const updateElapsed = () => {
      setLiveDurations((prev) => {
        const next = { ...prev }
        activeScans.forEach((scan) => {
          if (scan.status === "in_progress") {
            const start = new Date(scan.scanDate).getTime()
            next[scan.id] = Math.max(0, Math.floor((Date.now() - start) / 1000))
          } else {
            next[scan.id] = scan.durationSeconds
          }
        })
        return next
      })
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [activeScans])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="rounded-pill border border-white/20 bg-canvas-soft px-2.5 py-0.5 font-mono text-[10px] uppercase text-white">Completed</span>
      case "in_progress":
        return (
          <span className="flex items-center space-x-1.5 rounded-pill border border-accent-sunset/30 bg-canvas-soft px-2.5 py-0.5 font-mono text-[10px] uppercase text-accent-sunset">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Scanning...</span>
          </span>
        )
      case "failed":
        return <span className="rounded-pill border border-red-500/30 bg-canvas-soft px-2.5 py-0.5 font-mono text-[10px] uppercase text-red-400">Failed</span>
      default:
        return <span className="rounded-pill border border-hairline bg-canvas-soft px-2.5 py-0.5 font-mono text-[10px] uppercase text-gray-400">{status}</span>
    }
  }

  if (isLoading && !activeScans) {
    return (
      <div className="flex h-48 items-center justify-center rounded-sm border border-hairline bg-canvas-card p-6">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!activeScans || activeScans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-sm border border-hairline bg-canvas-card p-16 text-center max-w-2xl mx-auto my-12">
        <div className="relative mb-6">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-pill border border-hairline bg-canvas-soft text-white">
            <Shield className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl font-light text-white mb-2 tracking-display-sm">No Scans Found</h2>
        <p className="max-w-md text-sm text-gray-400 mb-8 leading-relaxed">
          You haven't run any key scans yet. Configure your scan sources to start monitoring your repositories and pastebins for exposed secrets.
        </p>
        <Link
          href="/scan/new"
          className="flex items-center space-x-2 rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Configure & Start Your First Scan</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-hairline">
        <div className="space-y-1">
          <h2 className="font-mono text-caption-mono-sm uppercase text-gray-500 tracking-caption-mono-sm">Scan History</h2>
          <p className="text-sm text-gray-400">View log history and findings of all key scan sessions.</p>
        </div>
        <Link
          href="/scan/new"
          className="mt-4 sm:mt-0 flex items-center justify-center space-x-2 rounded-pill border border-white bg-white px-4 py-2 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Scan</span>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-hairline hover:bg-transparent">
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Scan Date & Time</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Status</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Trigger</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Sources</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Repos Scanned</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Files Scanned</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Duration</TableHead>
            <TableHead className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Keys Found</TableHead>
            <TableHead className="text-right font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeScans.map((scan) => (
            <TableRow key={scan.id} className="border-hairline hover:bg-canvas-soft/30 transition-colors">
              <TableCell className="font-mono text-xs text-gray-300">
                {formatDateTime(scan.scanDate)}
              </TableCell>
              <TableCell>
                {getStatusBadge(scan.status)}
              </TableCell>
              <TableCell className="text-xs text-gray-300">
                {scan.triggerLink ? (
                  <a
                    href={scan.triggerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all font-mono text-[11px] uppercase tracking-wider"
                  >
                    <span>{scan.trigger}</span>
                    <ExternalLink className="h-3 w-3 text-gray-500" />
                  </a>
                ) : (
                  <span className="font-mono text-[11px] uppercase text-gray-400 tracking-wider">
                    {scan.trigger || "manual"}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs text-gray-300">
                <div className="flex items-center space-x-1.5">
                  <Database className="h-3.5 w-3.5 text-gray-500" />
                  <span>{scan.sourcesScanned} source(s)</span>
                </div>
              </TableCell>
              <TableCell className="text-xs text-gray-300">
                <span>{scan.reposScanned ?? 0} repo(s)</span>
              </TableCell>
              <TableCell className="text-xs text-gray-300">
                <span>{scan.filesScanned ?? 0} file(s)</span>
              </TableCell>
              <TableCell className="text-xs text-gray-300">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  <span>{formatDuration(liveDurations[scan.id] ?? scan.durationSeconds)}</span>
                </div>
              </TableCell>
              <TableCell>
                {scan.keysFound > 0 ? (
                  <div className="flex items-center space-x-1.5 text-accent-sunset font-mono text-xs">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>{scan.keysFound} key(s)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-gray-400 font-mono text-xs">
                    <Shield className="h-3.5 w-3.5 text-gray-600" />
                    <span>Clean (0)</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/scan/${scan.id}`}
                  className="inline-flex items-center space-x-1.5 rounded-pill border border-hairline bg-canvas px-3 py-1 font-mono text-[10px] uppercase text-gray-400 hover:text-white hover:border-white transition-colors"
                >
                  <span>Details</span>
                  <Eye className="h-3 w-3" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
