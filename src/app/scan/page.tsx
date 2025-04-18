import Layout from "@/components/Layout"
import ScanForm from "@/components/scan/ScanForm"

export default function ScanPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">New Scan</h1>
        <ScanForm />
      </div>
    </Layout>
  )
}
