import { createClient } from "@/lib/supabase/server"

export async function getAlertsDAL(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function markAlertAsReadDAL(userId: string, alertId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("id", alertId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUnreadAlertsCountDAL(userId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) throw error
  return count || 0
}

export async function insertAlertDAL(userId: string, alertData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("alerts")
    .insert({
      ...alertData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
