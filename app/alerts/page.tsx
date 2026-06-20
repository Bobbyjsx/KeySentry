import Layout from "@/components/Layout"
import AlertsList from "@/components/alerts/AlertsList"
import AlertsHeader from "@/components/alerts/AlertsHeader"
import { getAlertsAction } from "@/lib/actions/alerts"

export default async function AlertsPage() {
  const alerts = await getAlertsAction().catch(() => [])

  return (
    <Layout>
      <div className="space-y-6">
        <AlertsHeader />
        <AlertsList initialAlerts={alerts} />
      </div>
    </Layout>
  )
}
