"use client"

import { Bell, Filter } from "lucide-react"
import { useState } from "react"

export default function AlertsHeader() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="rounded-lg bg-gray-800 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-400">Severity</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Status</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Date Range</label>
              <select className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
