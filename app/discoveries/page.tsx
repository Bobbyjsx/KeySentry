import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Layout from "@/components/Layout"
import DiscoveriesHeader from "@/components/discoveries/DiscoveriesHeader"
import DiscoveriesList from "@/components/discoveries/DiscoveriesList"

export default async function DiscoveriesPage({ searchParams }: { searchParams: { key?: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  let query = supabase.from("api_keys").select("*").order("discovered_at", { ascending: false })

  // If a specific key is requested
  if (searchParams.key) {
    query = query.eq("id", searchParams.key)
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
