import Layout from "@/components/Layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 bg-gray-700" />

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-lg space-y-3">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-16 bg-gray-700" />
            </div>
          ))}
        </div>

        {/* Charts Skeletons */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg space-y-4">
            <Skeleton className="h-6 w-36 bg-gray-700" />
            <Skeleton className="h-64 w-full bg-gray-700" />
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg space-y-4">
            <Skeleton className="h-6 w-44 bg-gray-700" />
            <Skeleton className="h-64 w-full bg-gray-700" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg space-y-4">
          <Skeleton className="h-6 w-48 bg-gray-700" />
          <Skeleton className="h-64 w-full bg-gray-700" />
        </div>
      </div>
    </Layout>
  )
}
