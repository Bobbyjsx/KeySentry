import Layout from "@/components/Layout"
import DiscoveriesHeader from "@/components/discoveries/DiscoveriesHeader"
import DiscoveriesList from "@/components/discoveries/DiscoveriesList"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function DiscoveriesPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const resolvedSearchParams = await searchParams

  return (
    <Layout>
      <div className="space-y-6">
        <DiscoveriesHeader />
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-white" /></div>}>
          <DiscoveriesList keyId={resolvedSearchParams.key} />
        </Suspense>
      </div>
    </Layout>
  )
}
