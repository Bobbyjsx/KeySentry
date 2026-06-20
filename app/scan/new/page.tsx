import Layout from "@/components/Layout"
import ScanForm from "@/components/scan/ScanForm"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewScanPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link
            href="/scan"
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Scans
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">New Scan</h1>
        </div>
        <ScanForm />
      </div>
    </Layout>
  )
}
