import { createClient } from "@/lib/supabase/server"

export async function getDiscoveriesDAL(userId: string, keyId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("discovered_at", { ascending: false })

  if (keyId) {
    query = query.eq("id", keyId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function archiveDiscoveryDAL(userId: string, id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .update({ is_archived: true })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDiscoveryDAL(userId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
}

export async function insertDiscoveryDAL(userId: string, keyData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      ...keyData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllDiscoveriesDAL(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)

  if (error) throw error
  return data || []
}
