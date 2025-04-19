"use client"

import { searchAllPatterns, searchPattern } from "@/lib/github"
import type { ApiKey } from "@/types"
import { useQueries, useQuery } from "@tanstack/react-query"
import { AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useSupabase } from "./auth/AuthProvider"
import FilterBar from "./FilterBar"
import KeyTable from "./KeyTable"
import StatsCards from "./StatsCards"

const Dashboard = () => {
  const [filters, setFilters] = useState({
    provider: "all",
    status: "all",
    searchTerm: "",
  })

  // First query to get all search patterns
  const patternsQuery = useQuery({
    queryKey: ["searchPatterns"],
    queryFn: searchAllPatterns,
  })

  // Then query each pattern individually
  const patternQueries = useQueries({
    queries: (patternsQuery.data || []).map((pattern) => ({
      queryKey: ["apiKeys", pattern],
      queryFn: () => searchPattern(pattern),
      // Don't refetch on window focus for these heavy queries
      refetchOnWindowFocus: false,
      // Stale time of 5 minutes
      staleTime: 5 * 60 * 1000,
    })),
  })

  // Combine all results as they come in
  const allKeys = patternQueries.reduce<ApiKey[]>((acc, query) => {
    if (query.data) {
      return [...acc, ...query.data]
    }
    return acc
  }, [])

  // Remove duplicates by ID
  const uniqueKeys = Array.from(new Map(allKeys.map((item) => [item.id, item])).values())

  // Apply filters
  const filteredKeys = uniqueKeys.filter((key) => {
    const matchesProvider = filters.provider === "all" || key.provider === filters.provider
    const matchesStatus = filters.status === "all" || key.status === filters.status
    const matchesSearch =
      filters.searchTerm === "" ||
      key.key.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      key.discoveredAt.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      key.source.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (key.repository && key.repository.toLowerCase().includes(filters.searchTerm.toLowerCase()))

    return matchesProvider && matchesStatus && matchesSearch
  })

  // Calculate loading state
  const isLoading = patternsQuery.isLoading || patternQueries.some((q) => q.isLoading && !q.data)

  // Calculate if any queries are still fetching (but we might have partial data)
  const isFetching = patternQueries.some((q) => q.isFetching)

  // Calculate if any queries have errored
  const hasErrors = patternQueries.some((q) => q.isError)

  // Calculate stats for the cards
  const stats = {
    total: uniqueKeys.length,
    highRisk: uniqueKeys.filter((k) => k.status === "active").length,
    providers: new Set(uniqueKeys.map((k) => k.provider)).size || 0,
    sources: patternQueries.filter((q) => q.isSuccess).length,
  }


  const { supabase, user, session } = useSupabase()

  console.log("Sessiii",user, session)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">API Key Monitor</h1>
        <div className="flex items-center gap-2">
          {isFetching && (
            <div className="flex items-center text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching more results...
            </div>
          )}
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors">
            Export Data
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />
      <FilterBar filters={filters} setFilters={setFilters} />

      {hasErrors && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-300">Some queries failed due to GitHub API rate limits. Showing partial results.</p>
          </div>
        </div>
      )}

      {isLoading && uniqueKeys.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Searching for exposed API keys...</p>
        </div>
      ) : (
        <KeyTable keys={filteredKeys} />
      )}
    </div>
  )
}

export default Dashboard
