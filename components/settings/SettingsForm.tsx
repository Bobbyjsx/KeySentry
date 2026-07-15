"use client"

import type React from "react"
import { Moon, Save, Settings, Sun, Loader2, ShieldAlert, Search, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useGetSettings, useSaveSettings } from "@/hooks/data/useSettings/useSettings"
import type { UserSettings } from "@/lib/actions/settings"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { notifyServerError, isServerError } from "@/lib/server-error"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const settingsSchema = z.object({
  emailAlerts: z.boolean(),
  slackWebhook: z.string().optional().refine((val) => {
    if (!val) return true;
    try {
      const url = new URL(val);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "Slack Webhook must be a valid http or https URL" }),
  githubToken: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.startsWith("ghp_") || val.startsWith("github_pat_");
  }, { message: "GitHub Token must start with 'ghp_' or 'github_pat_'" }),
  scanFrequency: z.enum(["hourly", "daily", "weekly", "monthly", "manual"]),
  theme: z.enum(["light", "dark"]),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsForm() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [showToken, setShowToken] = useState(false)
  const [isChangingToken, setIsChangingToken] = useState(false)
  const defaultSettings: SettingsFormValues = {
    emailAlerts: true,
    slackWebhook: "",
    githubToken: "",
    scanFrequency: "daily",
    theme: "dark",
  }

  const { data: initialSettings, isLoading } = useGetSettings()
  const saveMutation = useSaveSettings()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  })

  const themeValue = watch("theme")
  const scanFrequencyValue = watch("scanFrequency")

  useEffect(() => {
    if (initialSettings) {
      if (isServerError(initialSettings)) {
        notifyServerError(initialSettings)
        return
      }
      reset({
        emailAlerts: initialSettings.emailAlerts ?? true,
        slackWebhook: initialSettings.slackWebhook || "",
        githubToken: initialSettings.githubToken || "",
        scanFrequency: (initialSettings.scanFrequency as any) || "daily",
        theme: (initialSettings.theme as any) || "dark",
      })
      if (!initialSettings.hasGithubToken) {
        setIsChangingToken(true)
      }
    }
  }, [initialSettings, reset])

  const onSubmit = async (data: SettingsFormValues) => {
    saveMutation.mutate(data, {
      onSuccess: (result) => {
        if (isServerError(result)) {
          notifyServerError(result)
          return
        }
        toast.success("Settings saved successfully")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to save settings")
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-sm border border-hairline bg-canvas-card p-6">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-sm border border-hairline bg-canvas-card p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="pb-6 border-b border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="flex items-center font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">
                <Settings className="mr-2 h-4 w-4 text-white" />
                General Settings
              </h2>
              <p className="text-sm text-gray-400">Configure your general application preferences.</p>
            </div>
            
            {user?.email && (
              <div className="rounded-sm border border-hairline bg-canvas-soft px-4 py-2 flex flex-col justify-center min-w-[200px]">
                <span className="font-mono text-[9px] uppercase text-gray-500 tracking-wider">Account (Authenticated)</span>
                <span className="font-mono text-xs text-white mt-0.5">{user.email}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase text-gray-400 tracking-caption-mono-sm">Theme</label>
              <div className="flex items-center space-x-6">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    value="light"
                    {...register("theme")}
                    className="h-4 w-4 border-hairline bg-canvas-soft text-white focus:ring-0 focus:ring-offset-0"
                  />
                  <Sun className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono text-xs uppercase tracking-wider">Light</span>
                </label>

                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    value="dark"
                    {...register("theme")}
                    className="h-4 w-4 border-hairline bg-canvas-soft text-white focus:ring-0 focus:ring-offset-0"
                  />
                  <Moon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono text-xs uppercase tracking-wider">Dark</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase text-gray-400 tracking-caption-mono-sm">Scan Frequency</label>
              <select
                {...register("scanFrequency")}
                className="block w-full rounded-pill border border-hairline bg-canvas-soft py-2 px-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
          </div>

          <div className="border-t border-hairline pt-6">
            <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">Notifications</h2>
            <p className="mt-1 text-sm text-gray-400">Configure how you want to be notified about new discoveries.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="emailAlerts"
                  type="checkbox"
                  {...register("emailAlerts")}
                  className="h-4 w-4 rounded-sm border-hairline bg-canvas-soft text-white focus:ring-0 focus:ring-offset-0"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailAlerts" className="font-mono text-xs uppercase text-gray-300 tracking-wider">
                  Email Alerts
                </label>
                <p className="text-xs text-gray-500">Receive email notifications for new API key discoveries and alerts.</p>
              </div>
            </div>

            <Input
              id="slackWebhook"
              type="text"
              label="Slack Webhook URL"
              placeholder="https://hooks.slack.com/services/..."
              helpText="Optional. Add a Slack webhook URL to receive notifications in your Slack workspace."
              error={errors.slackWebhook?.message}
              {...register("slackWebhook")}
            />
          </div>

          <div className="border-t border-hairline pt-6">
            <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">API Configuration</h2>
            <p className="mt-1 text-sm text-gray-400">Configure API tokens for scanning services.</p>
          </div>

          <div className="space-y-1.5">
            {initialSettings?.hasGithubToken && !isChangingToken ? (
              <div className="flex items-center justify-between rounded-sm border border-hairline bg-canvas-soft p-4">
                <div>
                  <h3 className="font-mono text-xs uppercase text-white tracking-wider">GitHub Token Configured</h3>
                  <p className="text-xs text-gray-500 mt-1">Your token is securely stored and actively used for scans.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingToken(true)}
                  className="rounded-pill border border-hairline bg-canvas px-4 py-1.5 font-mono text-xs uppercase text-white hover:bg-canvas-card transition-colors"
                >
                  Change Token
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="githubToken"
                  type={showToken ? "text" : "password"}
                  label="GitHub Personal Access Token"
                  placeholder="ghp_..."
                  helpText="Required for scanning GitHub repositories. Token needs 'repo' and 'read:user' scopes."
                  error={errors.githubToken?.message}
                  {...register("githubToken")}
                  rightNode={
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                {initialSettings?.hasGithubToken && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingToken(false)
                      reset({ ...watch(), githubToken: "" })
                    }}
                    className="text-xs font-mono uppercase text-gray-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-hairline">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center space-x-2 rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
