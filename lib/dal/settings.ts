import { createClient } from "@/lib/supabase/server"

export async function getSettingsDAL(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw error
  }
  return data
}

export async function insertSettingsDAL(userId: string, dbData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_settings")
    .insert({
      ...dbData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSettingsDAL(userId: string, settingId: string, dbData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_settings")
    .update(dbData)
    .eq("id", settingId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}
