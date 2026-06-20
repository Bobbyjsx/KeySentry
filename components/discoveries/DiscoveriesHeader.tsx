"use client"

import { Database, Download, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DiscoveriesHeader() {
  const router = useRouter()

  const exportData = () => {
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
    </div>
  )
}
