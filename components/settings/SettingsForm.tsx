"use client"

import type React from "react"

import { useState } from "react"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { Settings, Save, Moon, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/supabase"

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]

export default function SettingsForm({ initialSettings }: { initialSettings?: UserSettings }) {
  const defaultSettings: Partial<UserSettings> = {
    email_alerts: true,
    slack_webhook: "",
    github_token: "",
    scan_frequency: "daily",
    theme: "dark",
  }

  const [settings, setSettings] = useState<Partial<UserSettings>>(initialSettings || defaultSettings)
  const [loading, setLoading] = useState(false)
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const { toast } = useToast()

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
    setLoading(true)

    try {
      if (!user) throw new Error("User not authenticated")

      const updatedSettings = {
        ...settings,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (initialSettings?.id) {
        // Update existing settings
        const { error } = await supabase.from("user_settings").update(updatedSettings).eq("id", initialSettings.id)

        if (error) throw error
      } else {
        // Insert new settings
        const { error } = await supabase.from("user_settings").insert({
          ...updatedSettings,
          created_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
        variant: "success",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
                name="scan_frequency"
                value={settings.scan_frequency}
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
                  id="email_alerts"
                  name="email_alerts"
                  type="checkbox"
                  checked={settings.email_alerts}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email_alerts" className="font-medium text-gray-300">
                  Email Alerts
                </label>
                <p className="text-gray-500">Receive email notifications for new API key discoveries and alerts.</p>
              </div>
            </div>

            <div>
              <label htmlFor="slack_webhook" className="block text-sm font-medium text-gray-400">
                Slack Webhook URL
              </label>
              <input
                type="text"
                name="slack_webhook"
                id="slack_webhook"
                value={settings.slack_webhook || ""}
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
            <label htmlFor="github_token" className="block text-sm font-medium text-gray-400">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              name="github_token"
              id="github_token"
              value={settings.github_token || ""}
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
              disabled={loading}
              className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
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
