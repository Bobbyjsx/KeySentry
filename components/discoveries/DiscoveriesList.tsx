"use client"

import React from "react"
import { useGetDiscoveries, useArchiveDiscovery, useDeleteDiscovery } from "@/hooks/data/useDiscoveries/useDiscoveries"
import type { ApiKeyDiscovery } from "@/lib/actions/discoveries"
import { Archive, Check, ChevronDown, ChevronUp, Copy, DatabaseIcon, Edit, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function DiscoveriesList({
  initialKeys,
  keyId,
}: {
  initialKeys: ApiKeyDiscovery[]
  keyId?: string
}) {
  const { data: keys, isLoading } = useGetDiscoveries(keyId, initialKeys)
  const archiveMutation = useArchiveDiscovery()
  const deleteMutation = useDeleteDiscovery()

  const [sortField, setSortField] = useState<keyof ApiKeyDiscovery>("discoveredAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSort = (field: keyof ApiKeyDiscovery) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedKeys = [...(keys || [])].sort((a, b) => {
    const valA = a[sortField] ?? ""
    const valB = b[sortField] ?? ""
    if (valA < valB) return sortDirection === "asc" ? -1 : 1
    if (valA > valB) return sortDirection === "asc" ? 1 : -1
    return 0
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
      onSuccess: () => {
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
      onSuccess: () => {
        toast.success("API key has been permanently deleted")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete key")
      },
    })
  }

  const getProviderStyles = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return "bg-green-900 text-green-300"
      case "Anthropic":
        return "bg-purple-900 text-purple-300"
      case "Cohere":
        return "bg-blue-900 text-blue-300"
      case "Midjourney":
        return "bg-pink-900 text-pink-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-300"
      case "expired":
        return "bg-red-900 text-red-300"
      case "revoked":
        return "bg-gray-700 text-gray-300"
      default:
        return "bg-yellow-900 text-yellow-300"
    }
  }

  if (isLoading && !keys) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!keys || keys.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-gray-800 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-700 p-3">
          <DatabaseIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-xl font-medium text-white">No API keys found</h3>
        <p className="text-gray-400">Start a new scan to discover exposed API keys.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("keyHash")}>
                <span>API Key</span>
                {sortField === "keyHash" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("provider")}>
                <span>Provider</span>
                {sortField === "provider" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
              <button
                className="flex items-center space-x-1 focus:outline-none"
                onClick={() => handleSort("discoveredAt")}
              >
                <span>Discovered</span>
                {sortField === "discoveredAt" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("status")}>
                <span>Status</span>
                {sortField === "status" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("source")}>
                <span>Source</span>
                {sortField === "source" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-800">
          {sortedKeys.map((item) => (
            <React.Fragment key={item.id}>
              <tr
                className={`cursor-pointer transition-colors hover:bg-gray-700 ${expandedKey === item.id ? "bg-gray-700" : ""}`}
                onClick={() => toggleExpand(item.id)}
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-mono">
                  <span className="inline-block max-w-xs truncate">{item.keyHash}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${getProviderStyles(item.provider)}`}>
                    {item.provider}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{item.discoveredAt}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${getStatusStyles(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{item.source}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(item.keyHash, item.id)
                      }}
                      className="text-gray-400 transition-colors hover:text-white"
                      title="Copy API Key"
                    >
                      {copiedId === item.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 transition-colors hover:text-white"
                        title="View Source"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        archiveKey(item.id)
                      }}
                      disabled={archiveMutation.isPending}
                      className="text-gray-400 transition-colors hover:text-white disabled:opacity-50"
                      title="Archive Key"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedKey === item.id && (
                <tr className="bg-gray-750">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="space-y-3 rounded-md bg-gray-750 p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Full API Key</h4>
                          <div className="mt-1 flex items-center justify-between rounded bg-gray-900 p-2 font-mono">
                            <code className="break-all text-sm">{item.keyHash}</code>
                            <button
                              onClick={() => copyToClipboard(item.keyHash, `expanded-${item.id}`)}
                              className="ml-2 text-gray-400 hover:text-white"
                            >
                              {copiedId === `expanded-${item.id}` ? (
                                <Check size={14} className="text-green-400" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Risk Assessment</h4>
                          <div className="mt-1 text-sm">
                            <p>
                              <span className="text-gray-500">Risk Level:</span>{" "}
                              <span
                                className={
                                  item.riskLevel === "high"
                                    ? "text-red-400"
                                    : item.riskLevel === "medium"
                                      ? "text-yellow-400"
                                      : "text-green-400"
                                }
                              >
                                {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)}
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-500">Status:</span> {item.status}
                            </p>
                            <p>
                              <span className="text-gray-500">First Seen:</span> {item.discoveredAt}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Source Information</h4>
                        <div className="mt-1 text-sm">
                          <p>
                            <span className="text-gray-500">Source:</span> {item.source}
                          </p>
                          <p>
                            <span className="text-gray-500">URL:</span>{" "}
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300"
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
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Notes</h4>
                          <div className="mt-1 text-sm text-gray-300">{item.notes}</div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toast("Edit feature is coming soon")
                          }}
                          className="flex items-center space-x-1 rounded bg-gray-700 px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteKey(item.id)
                          }}
                          disabled={deleteMutation.isPending}
                          className="flex items-center space-x-1 rounded bg-red-900 px-3 py-1 text-sm text-red-300 hover:bg-red-800 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
