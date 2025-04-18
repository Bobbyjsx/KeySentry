"use client"

import { Database, Filter, Download, Plus } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DiscoveriesHeader() {
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const exportData = () => {
    // Implementation for exporting data
    alert("Export functionality will be implemented here")
  }

  const startNewScan = () => {
    router.push("/scan")
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Discoveries</h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={exportData}
            className="flex items-center space-x-1 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          <button
            onClick={startNewScan}
            className="flex items-center space-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Provider</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Providers</option>
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="Cohere">Cohere</option>
                <option value="Midjourney">Midjourney</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Status</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Source</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Sources</option>
                <option value="GitHub">GitHub</option>
                <option value="GitLab">GitLab</option>
                <option value="Pastebin">Pastebin</option>
                <option value="S3">S3 Bucket</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Date Range</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
