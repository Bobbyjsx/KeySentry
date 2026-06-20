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

    const validSources = sources.filter((source) => source.value.trim() !== "")
    if (validSources.length === 0) {
      toast.error("Please add at least one source to scan")
      return
    }

    toast.info("Your scan has been initiated and is running...")

    startScanMutation.mutate(
      { sources: validSources, scanDepth },
      {
        onSuccess: (data) => {
          toast.success(`Scan completed successfully! Found ${data.keysFound} key(s) in ${data.durationSeconds}s.`)
          router.push("/discoveries")
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to complete scan")
        },
      }
    )
  }

  const loading = startScanMutation.isPending

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
      <form onSubmit={startScan} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Configure Scan Sources</h2>
          <p className="mt-1 text-sm text-gray-400">Specify the sources you want to scan for exposed API keys.</p>
        </div>

        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1/4">
                <select
                  value={source.type}
                  onChange={(e) => updateSource(index, "type", e.target.value)}
                  className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="pastebin">Pastebin</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  {source.type === "github" && <Github className="h-5 w-5 text-gray-400" />}
                  {source.type === "gitlab" && <GitlabLogo className="h-5 w-5 text-gray-400" />}
                  {source.type === "pastebin" && <FileText className="h-5 w-5 text-gray-400" />}
                  {source.type === "other" && <Database className="h-5 w-5 text-gray-400" />}
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
                  className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 pr-3 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSource(index)}
                disabled={sources.length === 1}
                className="rounded-md bg-gray-700 p-2 text-gray-400 hover:bg-gray-600 hover:text-white disabled:opacity-50"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSource}
            className="flex items-center space-x-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Source</span>
          </button>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-white">Scan Options</h2>
          <p className="mt-1 text-sm text-gray-400">Configure additional options for your scan.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Scan Depth</label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  type="radio"
                  name="scanDepth"
                  value="shallow"
                  checked={scanDepth === "shallow"}
                  onChange={() => setScanDepth("shallow")}
                  className="h-4 w-4 border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Shallow (faster, less thorough)</span>
              </label>

              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  type="radio"
                  name="scanDepth"
                  value="deep"
                  checked={scanDepth === "deep"}
                  onChange={() => setScanDepth("deep")}
                  className="h-4 w-4 border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Deep (slower, more thorough)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
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
