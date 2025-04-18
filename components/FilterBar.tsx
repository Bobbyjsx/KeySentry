"use client"

import type React from "react"
import { Search, X } from "lucide-react"

interface FilterBarProps {
  filters: {
    provider: string
    status: string
    searchTerm: string
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      provider: string
      status: string
      searchTerm: string
    }>
  >
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const providers = ["all", "OpenAI", "Anthropic", "Cohere", "Midjourney", "Other"]
  const statuses = ["all", "active", "expired", "revoked", "unknown"]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value })
  }

  const clearSearch = () => {
    setFilters({ ...filters, searchTerm: "" })
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by key, date, or source"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-10 py-2 rounded-md bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {filters.searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.provider}
            onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
            className="rounded-md bg-gray-700 border border-gray-600 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {providers.map((provider) => (
              <option key={provider} value={provider}>
                {provider === "all" ? "All Providers" : provider}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-md bg-gray-700 border border-gray-600 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilters({ provider: "all", status: "all", searchTerm: "" })}
            className="rounded-md bg-gray-600 text-white py-2 px-3 hover:bg-gray-500 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
