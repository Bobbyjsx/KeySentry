import { createClient } from "@/lib/supabase/server"
import Layout from "@/components/Layout"
import AlertsList from "@/components/alerts/AlertsList"
import AlertsHeader from "@/components/alerts/AlertsHeader"

export default async function AlertsPage() {
  const supabase = await createClient()

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
