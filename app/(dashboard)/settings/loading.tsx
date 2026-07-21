import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <>
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-gray-700" />

        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-gray-700" />
            <Skeleton className="h-4 w-72 bg-gray-700" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 bg-gray-700" />
                <Skeleton className="h-4 w-48 bg-gray-700" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full bg-gray-700" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-28 bg-gray-700" />
              <Skeleton className="h-10 w-full bg-gray-700" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-28 bg-gray-700" />
              <Skeleton className="h-10 w-full bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
