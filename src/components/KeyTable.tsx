"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, Copy, ExternalLink, Check } from "lucide-react"
import type { ApiKey } from "../types"

interface KeyTableProps {
  keys: ApiKey[]
}

const KeyTable: React.FC<KeyTableProps> = ({ keys }) => {
  const [sortField, setSortField] = useState<keyof ApiKey>("discoveredAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSort = (field: keyof ApiKey) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedKeys = [...keys].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const toggleExpand = (id: string) => {
    setExpandedKey(expandedKey === id ? null : id)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Function to get provider-specific styles
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

  // Function to get status-specific styles
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

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("key")}>
                <span>API Key</span>
                {sortField === "key" && (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("provider")}>
                <span>Provider</span>
                {sortField === "provider" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <button
                className="flex items-center space-x-1 focus:outline-none"
                onClick={() => handleSort("discoveredAt")}
              >
                <span>Discovered</span>
                {sortField === "discoveredAt" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("status")}>
                <span>Status</span>
                {sortField === "status" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              <button className="flex items-center space-x-1 focus:outline-none" onClick={() => handleSort("source")}>
                <span>Source</span>
                {sortField === "source" &&
                  (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {sortedKeys.map((item) => (
            <React.Fragment key={item.id}>
              <tr
                className={`hover:bg-gray-700 cursor-pointer transition-colors ${expandedKey === item.id ? "bg-gray-700" : ""}`}
                onClick={() => toggleExpand(item.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  <span className="inline-block max-w-xs truncate">{item.key}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getProviderStyles(item.provider)}`}>
                    {item.provider}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.discoveredAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(item.key, item.id)
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
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
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View Source"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
              {expandedKey === item.id && (
                <tr className="bg-gray-750">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="bg-gray-750 rounded-md p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Full API Key</h4>
                          <div className="mt-1 font-mono bg-gray-900 p-2 rounded flex justify-between items-center">
                            <code className="text-sm break-all">{item.key}</code>
                            <button
                              onClick={() => copyToClipboard(item.key, `expanded-${item.id}`)}
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
                          <h4 className="text-sm font-medium text-gray-400">Metadata</h4>
                          <div className="mt-1 text-sm">
                            <p>
                              <span className="text-gray-500">First Seen:</span> {item.discoveredAt}
                            </p>
                            <p>
                              <span className="text-gray-500">Rate Limit:</span> {item.rateLimit || "Unknown"}
                            </p>
                            <p>
                              <span className="text-gray-500">Usage Count:</span> {item.usageCount || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Source Information</h4>
                        <div className="mt-1 text-sm">
                          <p>
                            <span className="text-gray-500">Source URL:</span> {item.link || "Unknown"}
                          </p>
                          <p>
                            <span className="text-gray-500">Discovered By:</span>{" "}
                            {item.discoveredBy || "Automatic scan"}
                          </p>
                          <p>
                            <span className="text-gray-500">Repository:</span> {item.repository || "N/A"}
                          </p>
                        </div>
                      </div>

                      {item.additionalInfo && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Additional Information</h4>
                          <div className="mt-1 text-sm text-gray-300">{item.additionalInfo}</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {sortedKeys.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                No API keys found matching your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default KeyTable
