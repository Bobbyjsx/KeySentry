import Layout from "@/components/Layout"
import SettingsForm from "@/components/settings/SettingsForm"
import { createClient } from "@/lib/supabase/component"

export default async function SettingsPage() {
  const supabase = createClient()

  const { data: settings } = await supabase.from("user_settings").select("*").single()

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <SettingsForm initialSettings={settings} />
      </div>
    </Layout>
  )
}
