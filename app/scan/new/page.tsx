import Layout from "@/components/Layout"
import ScanForm from "@/components/scan/ScanForm"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewScanPage() {
  return (
    <Layout>
      <div className="space-y-6 font-sans">
        <div className="flex items-center space-x-2">
          <Link
            href="/scan"
            className="flex items-center text-caption-mono-sm font-mono uppercase text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Scans
          </Link>
        </div>
        <div className="pb-4 border-b border-hairline">
          <h1 className="text-display-sm font-normal text-white tracking-display-sm">New Scan</h1>
        </div>
        <ScanForm />
      </div>
    </Layout>
  )
}
