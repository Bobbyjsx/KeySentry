import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Layout from "@/components/Layout"
import AlertsList from "@/components/alerts/AlertsList"
import AlertsHeader from "@/components/alerts/AlertsHeader"

export default async function AlertsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: alerts } = await supabase.from("alerts").select("*").order("created_at", { ascending: false })

  return (
    <Layout>
      <div className="space-y-6">
        <AlertsHeader />
        <AlertsList initialAlerts={alerts || []} />
      </div>
    </Layout>
  )
}
