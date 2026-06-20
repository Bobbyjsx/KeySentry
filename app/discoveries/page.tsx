import { createClient } from "@/lib/supabase/server"
import Layout from "@/components/Layout"
import DiscoveriesHeader from "@/components/discoveries/DiscoveriesHeader"
import DiscoveriesList from "@/components/discoveries/DiscoveriesList"

export default async function DiscoveriesPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  let query = supabase.from("api_keys").select("*").order("discovered_at", { ascending: false })

  // If a specific key is requested
  if (resolvedSearchParams.key) {
    query = query.eq("id", resolvedSearchParams.key)
  }

  const { data: keys } = await query

  return (
    <Layout>
      <div className="space-y-6">
        <DiscoveriesHeader />
        <DiscoveriesList initialKeys={keys || []} />
      </div>
    </Layout>
  )
}
