"use client"

import type React from "react"
import { Moon, Save, Settings, Sun, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useGetSettings, useSaveSettings } from "@/hooks/data/useSettings/useSettings"
import type { UserSettings } from "@/lib/actions/settings"
import { toast } from "sonner"

export default function SettingsForm() {
  const defaultSettings: UserSettings = {
    emailAlerts: true,
    slackWebhook: "",
    githubToken: "",
    scanFrequency: "daily",
    theme: "dark",
  }

  const { data: initialSettings, isLoading } = useGetSettings()
  const saveMutation = useSaveSettings()

  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <form onSubmit={saveSettings} className="space-y-6">
          <div>
            <h2 className="flex items-center text-xl font-semibold text-white">
              <Settings className="mr-2 h-5 w-5 text-indigo-400" />
              General Settings
            </h2>
            <p className="mt-1 text-sm text-gray-400">Configure your general application preferences.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">Theme</label>
              <div className="mt-2 flex items-center space-x-4">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={settings.theme === "light"}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Sun className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-300">Light</span>
                </label>

                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={settings.theme === "dark"}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Moon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-300">Dark</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Scan Frequency</label>
              <select
                name="scanFrequency"
                value={settings.scanFrequency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
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
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailAlerts" className="font-medium text-gray-300">
                  Email Alerts
                </label>
                <p className="text-gray-500">Receive email notifications for new API key discoveries and alerts.</p>
              </div>
            </div>

            <div>
              <label htmlFor="slackWebhook" className="block text-sm font-medium text-gray-400">
                Slack Webhook URL
              </label>
              <input
                type="text"
                name="slackWebhook"
                id="slackWebhook"
                value={settings.slackWebhook || ""}
                onChange={handleChange}
                placeholder="https://hooks.slack.com/services/..."
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Add a Slack webhook URL to receive notifications in your Slack workspace.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-white">API Configuration</h2>
            <p className="mt-1 text-sm text-gray-400">Configure API tokens for scanning services.</p>
          </div>

          <div>
            <label htmlFor="githubToken" className="block text-sm font-medium text-gray-400">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              name="githubToken"
              id="githubToken"
              value={settings.githubToken || ""}
              onChange={handleChange}
              placeholder="ghp_..."
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Required for scanning GitHub repositories. Token needs 'repo' and 'read:user' scopes.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
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
