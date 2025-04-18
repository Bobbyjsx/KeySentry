import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Layout from "@/components/Layout"
import SettingsForm from "@/components/settings/SettingsForm"
import type { Database } from "@/types/supabase"

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

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
