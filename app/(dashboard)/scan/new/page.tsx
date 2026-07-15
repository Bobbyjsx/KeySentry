
import ScanForm from "@/components/scan/ScanForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewScanPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/scan"
            className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Scans</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-display-sm">New Scan</h1>
          <p className="text-sm text-gray-400">Configure and execute a new key scan.</p>
        </div>
      </div>
      <ScanForm />
    </div>
  )
}
