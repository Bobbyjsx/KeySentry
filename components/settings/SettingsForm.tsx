"use client"

import type React from "react"
import { Moon, Save, Settings, Sun, Loader2, ShieldAlert, Search, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useGetSettings, useSaveSettings } from "@/hooks/data/useSettings/useSettings"
import { useGetPatterns } from "@/hooks/data/usePatterns/usePatterns"
import type { UserSettings } from "@/lib/actions/settings"
import { useSupabase } from "@/components/auth/AuthProvider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

export default function SettingsForm() {
  const { user } = useSupabase()
  const [showToken, setShowToken] = useState(false)
  const defaultSettings: UserSettings = {
    emailAlerts: true,
    slackWebhook: "",
    githubToken: "",
    scanFrequency: "daily",
    theme: "dark",
  }

  const { data: initialSettings, isLoading } = useGetSettings()
  const saveMutation = useSaveSettings()

  const { data: patterns, isLoading: patternsLoading } = useGetPatterns()
  const [patternSearch, setPatternSearch] = useState("")

  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  const filteredPatterns = patterns?.filter((p) => {
    return (
      p.name.toLowerCase().includes(patternSearch.toLowerCase()) ||
      p.provider.toLowerCase().includes(patternSearch.toLowerCase()) ||
      p.regex.toLowerCase().includes(patternSearch.toLowerCase())
    )
  })

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings)
    }
  }, [initialSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setSettings({ ...settings, [name]: checked })
    } else {
      setSettings({ ...settings, [name]: value })
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation: Slack webhook URL format (if provided)
    if (settings.slackWebhook) {
      const webhook = settings.slackWebhook.trim()
      if (webhook !== "") {
        try {
          const url = new URL(webhook)
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            toast.error("Slack Webhook URL must start with http:// or https://")
            return
          }
        } catch (err) {
          toast.error("Slack Webhook must be a valid URL")
          return
        }
      }
    }

    // Client-side validation: GitHub token prefix (if provided)
    if (settings.githubToken) {
      const token = settings.githubToken.trim()
      if (token !== "") {
        if (!token.startsWith("ghp_") && !token.startsWith("github_pat_")) {
          toast.error("GitHub Token must start with 'ghp_' (classic) or 'github_pat_' (fine-grained)")
          return
        }
      }
    }

    saveMutation.mutate(settings, {
      onSuccess: () => {
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
        <form onSubmit={saveSettings} className="space-y-6">
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
                    name="theme"
                    value="light"
                    checked={settings.theme === "light"}
                    onChange={handleChange}
                    className="h-4 w-4 border-hairline bg-canvas-soft text-white focus:ring-0 focus:ring-offset-0"
                  />
                  <Sun className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300 font-mono text-xs uppercase tracking-wider">Light</span>
                </label>

                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={settings.theme === "dark"}
                    onChange={handleChange}
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
                name="scanFrequency"
                value={settings.scanFrequency}
                onChange={handleChange}
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
                  name="emailAlerts"
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={handleChange}
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

            <div className="space-y-1.5">
              <label htmlFor="slackWebhook" className="block font-mono text-[10px] uppercase text-gray-400 tracking-caption-mono-sm">
                Slack Webhook URL
              </label>
              <input
                type="text"
                name="slackWebhook"
                id="slackWebhook"
                value={settings.slackWebhook || ""}
                onChange={handleChange}
                placeholder="https://hooks.slack.com/services/..."
                className="block w-full rounded-sm border border-hairline bg-canvas-soft py-2.5 px-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white transition-colors"
              />
              <p className="text-[10px] text-gray-500">
                Optional. Add a Slack webhook URL to receive notifications in your Slack workspace.
              </p>
            </div>
          </div>

          <div className="border-t border-hairline pt-6">
            <h2 className="font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">API Configuration</h2>
            <p className="mt-1 text-sm text-gray-400">Configure API tokens for scanning services.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="githubToken" className="block font-mono text-[10px] uppercase text-gray-400 tracking-caption-mono-sm">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                name="githubToken"
                id="githubToken"
                value={settings.githubToken || ""}
                onChange={handleChange}
                placeholder="ghp_..."
                className="block w-full rounded-sm border border-hairline bg-canvas-soft py-2.5 pl-3.5 pr-10 text-sm text-white placeholder-gray-600 outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              Required for scanning GitHub repositories. Token needs 'repo' and 'read:user' scopes.
            </p>
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

      <div className="rounded-sm border border-hairline bg-canvas-card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="flex items-center font-mono text-caption-mono-sm uppercase text-white tracking-caption-mono">
            <ShieldAlert className="mr-2 h-4 w-4 text-white" />
            Exposed Key Detection Registry
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            View the regular expression patterns currently used to scan repositories for sensitive credentials.
          </p>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search patterns by provider, rule name, or regex..."
              value={patternSearch}
              onChange={(e) => setPatternSearch(e.target.value)}
              className="block w-full rounded-pill border border-hairline bg-canvas-soft pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Patterns List */}
        {patternsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : filteredPatterns && filteredPatterns.length > 0 ? (
          <div className="max-h-96 overflow-y-auto rounded-sm border border-hairline bg-canvas-soft/10">
            <Table>
              <TableHeader>
                <TableRow className="border-hairline hover:bg-transparent bg-canvas-soft/30 sticky top-0 z-10">
                  <TableHead className="px-4 py-2 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                    Provider
                  </TableHead>
                  <TableHead className="px-4 py-2 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                    Rule Name
                  </TableHead>
                  <TableHead className="px-4 py-2 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                    Severity / Risk
                  </TableHead>
                  <TableHead className="px-4 py-2 font-mono text-[10px] uppercase text-gray-500 tracking-caption-mono-sm">
                    Regex Pattern
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatterns.map((p) => (
                  <TableRow key={p.id} className="border-hairline hover:bg-canvas-soft/20 transition-colors">
                    <TableCell className="px-4 py-2.5 font-mono text-xs text-white">
                      {p.provider}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-300">
                      {p.name}
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span
                        className={`rounded-pill border px-2 py-0.5 font-mono text-[10px] uppercase ${
                          p.riskLevel === "critical"
                            ? "border-red-500/20 text-red-400"
                            : p.riskLevel === "high"
                              ? "border-accent-sunset/20 text-accent-sunset"
                              : p.riskLevel === "medium"
                                ? "border-accent-twilight/20 text-accent-twilight"
                                : "border-accent-breeze/20 text-accent-breeze"
                        }`}
                      >
                        {p.riskLevel}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 font-mono text-xs text-gray-400 break-all max-w-xs truncate" title={p.regex}>
                      {p.regex}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center rounded-sm bg-canvas-soft/10 border border-hairline text-gray-500 font-mono text-xs uppercase tracking-wider">
            <span>No patterns found</span>
          </div>
        )}
      </div>
    </div>
  )
}
