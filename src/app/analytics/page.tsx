import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Layout from "@/components/Layout"
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview"
import DiscoveryTrends from "@/components/analytics/DiscoveryTrends"
import ProviderDistribution from "@/components/analytics/ProviderDistribution"
import RiskAssessment from "@/components/analytics/RiskAssessment"
import type { Database } from "@/types/supabase"

export default async function AnalyticsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  // Get API keys data
  const { data: keys } = await supabase.from("api_keys").select("*")

  // Get scan history data
  const { data: scanHistory } = await supabase
    .from("scan_history")
    .select("*")
    .order("scan_date", { ascending: false })
    .limit(30)

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>

        <AnalyticsOverview keys={keys || []} scanHistory={scanHistory || []} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DiscoveryTrends scanHistory={scanHistory || []} />
          <ProviderDistribution keys={keys || []} />
        </div>

        <RiskAssessment keys={keys || []} />
      </div>
    </Layout>
  )
}
