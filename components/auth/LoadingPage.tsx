"use client"

import { Shield, Loader2 } from "lucide-react"

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas text-white font-sans">
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-6 animate-pulse rounded-pill bg-white/5 blur-xl pointer-events-none" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-pill border border-hairline bg-canvas-card">
          <Shield className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <span className="block text-caption-mono-sm font-mono uppercase text-gray-500">
          Resolving secure session
        </span>
        <h1 className="text-display-xs font-normal text-white tracking-display-sm">
          KeySentry
        </h1>
      </div>

      <div className="mt-8 flex items-center space-x-2 text-caption-mono-sm font-mono text-gray-600 uppercase">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Verifying credentials</span>
      </div>
    </div>
  )
}
