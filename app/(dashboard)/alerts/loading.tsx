import Layout from "@/components/Layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function AlertsLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32 bg-gray-700" />
          <Skeleton className="h-10 w-28 bg-gray-700" />
        </div>

        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-md flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-1/3 bg-gray-700" />
                  <Skeleton className="h-4 w-20 bg-gray-700" />
                </div>
                <Skeleton className="h-4 w-2/3 bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
