import { createClient } from "@/lib/supabase/server"

export async function createScanHistoryDAL(userId: string, scanData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scan_history")
    .insert({
      ...scanData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getScanHistoryDAL(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("user_id", userId)
    .order("scan_date", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getScanHistoryDetailsDAL(userId: string, scanId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", userId)
    .single()

  if (error) throw error
  return data
}

export async function getScanDiscoveriesDAL(userId: string, scanId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("scan_id", scanId)
    .eq("user_id", userId)

  if (error) throw error
  return data || []
}

export async function updateScanStatusDAL(scanId: string, updateData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scan_history")
    .update(updateData)
    .eq("id", scanId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentScanHistoryDAL(userId: string, limit: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("user_id", userId)
    .order("scan_date", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
