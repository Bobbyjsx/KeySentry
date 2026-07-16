import SettingsForm from "@/components/settings/SettingsForm"

export default async function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <SettingsForm />
    </div>
  )
}
