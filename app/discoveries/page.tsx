import Layout from "@/components/Layout"
import DiscoveriesHeader from "@/components/discoveries/DiscoveriesHeader"
import DiscoveriesList from "@/components/discoveries/DiscoveriesList"
import { getDiscoveriesAction } from "@/lib/actions/discoveries"

export default async function DiscoveriesPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const resolvedSearchParams = await searchParams
  const keys = await getDiscoveriesAction(resolvedSearchParams.key).catch(() => [])

  return (
    <Layout>
      <div className="space-y-6">
        <DiscoveriesHeader />
        <DiscoveriesList initialKeys={keys} keyId={resolvedSearchParams.key} />
      </div>
    </Layout>
  )
}
