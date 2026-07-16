"use client"

import type React from "react"
import { useStartScan } from "@/hooks/data/useScan/useScan"
import { Database, FileText, Github, GitlabIcon as GitlabLogo, Minus, Plus, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { isServerError, notifyServerError } from "@/lib/server-error"
import { Input } from "@/components/ui/input"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const scanFormSchema = z.object({
  target: z.string().min(1, "Target is required").refine((val) => {
    const value = val.replace(/\s+/g, "");
    if (value.includes("/")) {
      const parts = value.split("/");
      return parts.length === 2 && parts[0].trim() !== "" && parts[1].trim() !== "";
    }
    return /^[a-zA-Z0-9-_]+$/.test(value);
  }, { message: "Invalid format. Must be an organization, username, or owner/repo format." })
});

type ScanFormValues = z.infer<typeof scanFormSchema>

export default function ScanForm() {
  const router = useRouter()
  const startScanMutation = useStartScan()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      target: "",
    },
  })

  const onSubmit = async (data: ScanFormValues) => {
    startScanMutation.mutate(
      { target: data.target.replace(/\s+/g, "") },
      {
        onSuccess: (resData) => {
          if (isServerError(resData)) {
            notifyServerError(resData)
            return
          }
          if (resData && typeof resData === "object" && "success" in resData && !resData.success) {
            toast.error(resData.error || "Failed to start scan")
            return
          }
          toast.success("Scan initiated in the background! Redirecting to details...")
          const scanUrl = `/scan/${resData.scanId}`
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="pb-6 border-b border-hairline space-y-1">
          <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono flex items-center">
            Configure Scan Sources
          </h2>
          <p className="text-sm text-gray-400 font-sans">Specify the sources you want to scan for exposed API keys.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              label="GitHub Target"
              {...register("target")}
              placeholder="username, organization, or owner/repo"
              error={errors.target?.message}
              leftNode={<Github className="h-4 w-4 text-gray-400" />}
            />
            <p className="mt-2 text-xs text-gray-500 font-mono">
              Provide a username or organization to scan all their repositories, or an exact owner/repo format for a specific repository.
            </p>
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
