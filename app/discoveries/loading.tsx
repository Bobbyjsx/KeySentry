import Layout from "@/components/Layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function DiscoveriesLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 bg-gray-700" />
          <Skeleton className="h-10 w-36 bg-gray-700" />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 shadow-xl p-6">
          <div className="space-y-4">
            <div className="flex space-x-4 border-b border-gray-700 pb-4">
              <Skeleton className="h-6 w-1/4 bg-gray-700" />
              <Skeleton className="h-6 w-1/6 bg-gray-700" />
              <Skeleton className="h-6 w-1/6 bg-gray-700" />
              <Skeleton className="h-6 w-1/6 bg-gray-700" />
              <Skeleton className="h-6 w-1/6 bg-gray-700" />
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex space-x-4 py-2 items-center">
                <Skeleton className="h-8 w-1/4 bg-gray-700" />
                <Skeleton className="h-6 w-1/6 bg-gray-700" />
                <Skeleton className="h-6 w-1/6 bg-gray-700" />
                <Skeleton className="h-6 w-1/6 bg-gray-700" />
                <Skeleton className="h-6 w-1/6 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
