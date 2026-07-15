"use client"

import React, { useState, useEffect } from "react"
import { useGetDiscoveries, useArchiveDiscovery, useDeleteDiscovery } from "@/hooks/data/useDiscoveries/useDiscoveries"
import type { ApiKeyDiscovery } from "@/lib/actions/discoveries"
import { Archive, Check, ChevronDown, ChevronUp, Copy, DatabaseIcon, Edit, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { formatDateTime } from "@/lib/date"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { isServerError, notifyServerError } from "@/lib/server-error"

export default function DiscoveriesList({
  keyId,
}: {
  keyId?: string
}) {
  const { data: keys, isLoading } = useGetDiscoveries(keyId)
  const uniqueProviders = Array.from(new Set((!keys || isServerError(keys) ? [] : keys).map((k: any) => k.provider).filter(Boolean))).sort()
  const archiveMutation = useArchiveDiscovery()
  const deleteMutation = useDeleteDiscovery()
  const searchParams = useSearchParams()

  const [sortField, setSortField] = useState<keyof ApiKeyDiscovery>("discoveredAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [provider, setProvider] = useState("all")
  const [status, setStatus] = useState("all")
  const [source, setSource] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  // Initialize search term from URL query parameter
  useEffect(() => {
    const urlSearch = searchParams.get("search")
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    if (keys && isServerError(keys)) {
      notifyServerError(keys)
    }
  }, [keys])

  const safeKeys = (!keys || isServerError(keys)) ? [] : keys

  const handleSort = (field: keyof ApiKeyDiscovery) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedKeys = [...safeKeys].sort((a, b) => {
    const valA = a[sortField] ?? ""
    const valB = b[sortField] ?? ""
    if (valA < valB) return sortDirection === "asc" ? -1 : 1
    if (valA > valB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const filteredKeys = sortedKeys.filter((key) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      key.keyHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (key.repository && key.repository.toLowerCase().includes(searchTerm.toLowerCase())) ||
      key.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.source.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesProvider = provider === "all" || key.provider === provider
    const matchesStatus = status === "all" || key.status === status
    const matchesSource = source === "all" || key.source === source

    let matchesDate = true
    if (dateRange !== "all") {
      const now = Date.now()
      const discoveryTime = new Date(key.discoveredAt).getTime()
      const diffDays = Math.max(0, Math.floor((now - discoveryTime) / (1000 * 60 * 60 * 24)))
      
      if (dateRange === "today") {
        matchesDate = diffDays <= 1
      } else if (dateRange === "week") {
        matchesDate = diffDays <= 7
      } else if (dateRange === "month") {
        matchesDate = diffDays <= 30
      }
    }

    return matchesSearch && matchesProvider && matchesStatus && matchesSource && matchesDate
  })

  const toggleExpand = (id: string) => {
    setExpandedKey(expandedKey === id ? null : id)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("API key has been copied to your clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const archiveKey = async (id: string) => {
    archiveMutation.mutate(id, {
      onSuccess: (res) => {
        if (isServerError(res)) {
          notifyServerError(res)
          return
        }
        toast.success("API key has been archived")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to archive key")
      },
    })
  }

  const deleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this key? This action cannot be undone.")) return

    deleteMutation.mutate(id, {
      onSuccess: (res) => {
        if (isServerError(res)) {
          notifyServerError(res)
          return
        }
        toast.success("API key has been permanently deleted")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete key")
      },
    })
  }

  const getProviderStyles = (p: string) => {
    switch (p) {
      case "OpenAI":
        return "border-accent-sunset/30 text-accent-sunset"
      case "Anthropic":
        return "border-accent-dusk/30 text-accent-twilight"
      case "Cohere":
        return "border-accent-twilight/30 text-accent-twilight"
      case "Midjourney":
        return "border-accent-breeze/30 text-accent-breeze"
      default:
        return "border-hairline text-gray-400"
    }
  }

  const getStatusStyles = (s: string) => {
    switch (s) {
      case "active":
        return "border-white/20 text-white"
      case "expired":
        return "border-red-500/20 text-red-400"
      case "revoked":
        return "border-hairline text-gray-500"
      default:
        return "border-accent-sunset/20 text-accent-sunset"
    }
  }

  if (isLoading && !keys) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-hairline bg-canvas-card p-6">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!safeKeys || safeKeys.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-sm border border-hairline bg-canvas-card p-8 text-center">
        <div className="mb-4 rounded-pill border border-hairline bg-canvas-soft p-3">
          <DatabaseIcon className="h-6 w-6 text-white" />
        </div>
        <h3 className="mb-1 font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">No API keys found</h3>
        <p className="text-sm text-gray-400">Start a new scan to discover exposed API keys.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Search and Filters Bar */}
      <div className="rounded-sm border border-hairline bg-canvas-card p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          {/* Search Term */}
          <div>
            <Input
              type="text"
              label="Search"
              placeholder="Search keys, repos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="mt-1.5 block w-full rounded-pill border border-hairline bg-canvas-soft py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="all">All Providers</option>
              {uniqueProviders.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1.5 block w-full rounded-pill border border-hairline bg-canvas-soft py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1.5 block w-full rounded-pill border border-hairline bg-canvas-soft py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="all">All Sources</option>
              <option value="GitHub">GitHub</option>
              <option value="GitLab">GitLab</option>
              <option value="Pastebin">Pastebin</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="mt-1.5 block w-full rounded-pill border border-hairline bg-canvas-soft py-1.5 px-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="all">All Time</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-hairline bg-canvas-card overflow-hidden">
        {filteredKeys.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-8 text-center">
            <DatabaseIcon className="h-6 w-6 text-white mb-2" />
            <p className="text-gray-400 text-sm font-medium">No results match your search filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-hairline hover:bg-transparent">
                <TableHead className="px-6 py-3 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                  <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("keyHash")}>
                    <span>API Key</span>
                    {sortField === "keyHash" &&
                      (sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </TableHead>
                <TableHead className="px-6 py-3 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                  <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("provider")}>
                    <span>Provider</span>
                    {sortField === "provider" &&
                      (sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </TableHead>
                <TableHead className="px-6 py-3 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                  <button
                    className="flex items-center space-x-1 focus:outline-none"
                    onClick={() => handleSort("discoveredAt")}
                  >
                    <span>Discovered</span>
                    {sortField === "discoveredAt" &&
                      (sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </TableHead>
                <TableHead className="px-6 py-3 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                  <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("status")}>
                    <span>Status</span>
                    {sortField === "status" &&
                      (sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </TableHead>
                <TableHead className="px-6 py-3 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                  <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("source")}>
                    <span>Source</span>
                    {sortField === "source" &&
                      (sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                </TableHead>
                <TableHead className="px-6 py-3 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow
                    className={`cursor-pointer border-hairline transition-colors hover:bg-canvas-soft/30 ${expandedKey === item.id ? "bg-canvas-soft/40" : ""}`}
                    onClick={() => toggleExpand(item.id)}
                  >
                    <TableCell className="px-6 py-4 font-mono text-xs text-white">
                      <span className="inline-block max-w-xs truncate">{item.keyHash}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`rounded-pill border px-2 py-0.5 font-mono text-[10px] uppercase ${getProviderStyles(item.provider)}`}>
                        {item.provider}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-gray-300 font-mono">{formatDateTime(item.discoveredAt)}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`rounded-pill border px-2 py-0.5 font-mono text-[10px] uppercase ${getStatusStyles(item.status)}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-gray-300 font-mono">{item.source}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-300">
                      <div className="flex space-x-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(item.keyHash, item.id)
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Copy API Key"
                        >
                          {copiedId === item.id ? <Check size={14} className="text-accent-breeze" /> : <Copy size={14} />}
                        </button>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="View Source"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            archiveKey(item.id)
                          }}
                          disabled={archiveMutation.isPending}
                          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                          title="Archive Key"
                        >
                          <Archive size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedKey === item.id && (
                    <TableRow className="border-hairline bg-canvas-soft/20 hover:bg-canvas-soft/20">
                      <TableCell colSpan={6} className="px-6 py-6">
                        <div className="space-y-4 rounded-sm border border-hairline bg-canvas-soft p-5 font-sans">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                              <h4 className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Full API Key</h4>
                              <div className="flex items-center justify-between rounded-sm border border-hairline bg-canvas p-3 font-mono">
                                <code className="break-all text-xs text-white">{item.keyHash}</code>
                                <button
                                  onClick={() => copyToClipboard(item.keyHash, `expanded-${item.id}`)}
                                  className="ml-3 text-gray-400 hover:text-white transition-colors"
                                >
                                  {copiedId === `expanded-${item.id}` ? (
                                    <Check size={14} className="text-accent-breeze" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Risk Assessment</h4>
                              <div className="text-xs space-y-1 text-gray-300 font-mono">
                                <p>
                                  <span className="text-gray-500">Risk Level:</span>{" "}
                                  <span
                                    className={
                                      item.riskLevel === "high" || item.riskLevel === "critical"
                                        ? "text-accent-sunset font-normal"
                                        : item.riskLevel === "medium"
                                          ? "text-accent-twilight font-normal"
                                          : "text-accent-breeze font-normal"
                                    }
                                  >
                                    {item.riskLevel.toUpperCase()}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-gray-500">Status:</span> {item.status.toUpperCase()}
                                </p>
                                <p>
                                  <span className="text-gray-500">First Seen:</span> {formatDateTime(item.discoveredAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-hairline/50">
                            <h4 className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Source Information</h4>
                            <div className="text-xs space-y-1 text-gray-300 font-mono">
                              <p>
                                <span className="text-gray-500">Source:</span> {item.source.toUpperCase()}
                              </p>
                              <p>
                                <span className="text-gray-500">URL:</span>{" "}
                                {item.link ? (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white underline hover:text-gray-300 transition-colors"
                                  >
                                    {item.link}
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </p>
                              <p>
                                <span className="text-gray-500">Repository:</span> {item.repository || "N/A"}
                              </p>
                            </div>
                          </div>

                          {item.notes && (
                            <div className="space-y-2 pt-2 border-t border-hairline/50">
                              <h4 className="font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">Notes</h4>
                              <div className="text-xs text-gray-300">{item.notes}</div>
                            </div>
                          )}

                          <div className="flex justify-end space-x-2.5 pt-4 border-t border-hairline/50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toast("Edit feature is coming soon")
                              }}
                              className="flex items-center space-x-2 rounded-pill border border-hairline bg-canvas px-4 py-2 font-mono text-[10px] uppercase text-gray-400 hover:text-white hover:border-white transition-colors"
                            >
                              <Edit size={12} />
                              <span>Edit Notes</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteKey(item.id)
                              }}
                              disabled={deleteMutation.isPending}
                              className="flex items-center space-x-2 rounded-pill border border-red-500/20 bg-canvas px-4 py-2 font-mono text-[10px] uppercase text-red-400 hover:border-red-500 hover:text-red-300 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                              <span>Delete Key</span>
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
