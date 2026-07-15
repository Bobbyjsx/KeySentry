import Layout from "@/components/Layout"
import AlertsList from "@/components/alerts/AlertsList"
import AlertsHeader from "@/components/alerts/AlertsHeader"

export default function AlertsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <AlertsHeader />
        <AlertsList />
      </div>
    </Layout>
  )
}
