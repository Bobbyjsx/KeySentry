import Layout from "@/components/Layout"
import ScanForm from "@/components/scan/ScanForm"
import ScanHistoryList from "@/components/scan/ScanHistoryList"
import { getScanHistoryAction } from "@/lib/actions/scan"

export default async function ScanPage() {
  const scanHistory = await getScanHistoryAction().catch(() => [])

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">New Scan</h1>
        <ScanForm />
        <ScanHistoryList initialScans={scanHistory} />
      </div>
    </Layout>
  )
}
