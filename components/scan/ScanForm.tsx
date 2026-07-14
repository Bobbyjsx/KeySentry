"use client"

import type React from "react"
import { useStartScan } from "@/hooks/data/useScan/useScan"
import { Database, FileText, Github, GitlabIcon as GitlabLogo, Minus, Plus, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type ScanSource = {
  type: "github" | "gitlab" | "pastebin" | "other"
  value: string
}

export default function ScanForm() {
  const [sources, setSources] = useState<ScanSource[]>([{ type: "github", value: "" }])
  const [scanDepth, setScanDepth] = useState<"shallow" | "deep">("shallow")
  const router = useRouter()
  const startScanMutation = useStartScan()

  const addSource = () => {
    setSources([...sources, { type: "github", value: "" }])
  }

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index))
  }

  const updateSource = (index: number, field: keyof ScanSource, value: string) => {
    const newSources = [...sources]
    if (field === "type") {
      newSources[index].type = value as ScanSource["type"]
    } else {
      newSources[index].value = value
    }
    setSources(newSources)
  }

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault()

    const validSources = sources
      .map((source) => ({
        type: source.type,
        value: source.value.replace(/\s+/g, ""), // Strip all whitespaces
      }))
      .filter((source) => source.value !== "")

    if (validSources.length === 0) {
      toast.error("Please add at least one source to scan")
      return
    }

    // Client-side format checks
    for (const source of validSources) {
      if (source.type === "github" || source.type === "gitlab") {
        if (source.value.includes("/")) {
          const parts = source.value.split("/")
          if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
            toast.error(`Invalid repository format: "${source.value}". Must be in "owner/repo" format.`)
            return
          }
        } else {
          // Username/organization
          if (!/^[a-zA-Z0-9-_]+$/.test(source.value)) {
            toast.error(`Invalid account format: "${source.value}". Must contain only alphanumeric characters, hyphens, or underscores.`)
            return
          }
        }
      }
    }

    startScanMutation.mutate(
      { sources: validSources, scanDepth },
      {
        onSuccess: (data) => {
          if (!data.success) {
            toast.error(data.error || "Failed to start scan")
            return
          }
          toast.success("Scan initiated in the background! Redirecting to details...")
          const scanUrl = `/scan/${data.scanId}`
          router.push(scanUrl)
          // Fallback redirect
          setTimeout(() => {
            if (window.location.pathname !== scanUrl) {
              window.location.href = scanUrl
            }
          }, 500)
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to start scan")
        },
      }
    )
  }

  const loading = startScanMutation.isPending

  return (
    <div className="rounded-sm border border-hairline bg-canvas-card p-6 sm:p-8">
      <form onSubmit={startScan} className="space-y-6">
        <div className="pb-6 border-b border-hairline space-y-1">
          <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono flex items-center">
            Configure Scan Sources
          </h2>
          <p className="text-sm text-gray-400 font-sans">Specify the sources you want to scan for exposed API keys.</p>
        </div>

        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-1/4">
                <select
                  value={source.type}
                  onChange={(e) => updateSource(index, "type", e.target.value)}
                  className="block w-full rounded-pill border border-hairline bg-canvas-soft py-2 px-3 text-xs text-white placeholder-gray-600 outline-none focus:border-white transition-colors cursor-pointer"
                >
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="pastebin">Pastebin</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  {source.type === "github" && <Github className="h-4 w-4 text-gray-400" />}
                  {source.type === "gitlab" && <GitlabLogo className="h-4 w-4 text-gray-400" />}
                  {source.type === "pastebin" && <FileText className="h-4 w-4 text-gray-400" />}
                  {source.type === "other" && <Database className="h-4 w-4 text-gray-400" />}
                </div>
                <input
                  type="text"
                  value={source.value}
                  onChange={(e) => updateSource(index, "value", e.target.value)}
                  placeholder={
                    source.type === "github"
                      ? "username/repo or organization"
                      : source.type === "gitlab"
                        ? "username/repo or group"
                        : source.type === "pastebin"
                          ? "username or search term"
                          : "URL or search term"
                  }
                  className="block w-full rounded-sm border border-hairline bg-canvas-soft py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-gray-600 outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSource(index)}
                disabled={sources.length === 1}
                className="rounded-full border border-white/20 bg-canvas-soft p-2.5 text-gray-400 hover:text-white hover:bg-canvas-soft/80 disabled:opacity-50 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSource}
            className="flex items-center space-x-1.5 rounded-pill border border-white/20 bg-transparent px-3 py-1.5 font-mono text-xs uppercase text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Source</span>
          </button>
        </div>

        <div className="border-t border-hairline pt-6 space-y-1">
          <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">Scan Options</h2>
          <p className="text-sm text-gray-400 font-sans">Configure additional options for your scan.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase text-gray-400 tracking-caption-mono-sm mb-2">Scan Depth</label>
            <div className="mt-2 flex items-center space-x-6">
              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  type="radio"
                  name="scanDepth"
                  value="shallow"
                  checked={scanDepth === "shallow"}
                  onChange={() => setScanDepth("shallow")}
                  className="h-4 w-4 border-hairline bg-canvas-soft text-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-300 font-mono uppercase tracking-wider">Shallow (faster)</span>
              </label>

              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  type="radio"
                  name="scanDepth"
                  value="deep"
                  checked={scanDepth === "deep"}
                  onChange={() => setScanDepth("deep")}
                  className="h-4 w-4 border-hairline bg-canvas-soft text-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-300 font-mono uppercase tracking-wider">Deep (thorough)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-hairline">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Start Scan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
