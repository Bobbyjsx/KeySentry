import Layout from "@/components/Layout"

export default function AlertsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-gray-400">This page will show alerts for critical API key exposures.</p>
      </div>
    </Layout>
  )
}
