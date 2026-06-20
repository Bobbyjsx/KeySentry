"use server"

import { createClient } from "@/lib/supabase/server"
import { keysToCamel, keysToSnake } from "@/lib/case-transform"

export interface ApiKeyDiscovery {
  id: string
  userId: string
  keyHash: string
  provider: string
  status: string
  source: string
  link: string | null
  repository: string | null
  riskLevel: string
  discoveredAt: string
  isArchived: boolean
  notes: string | null
}

export async function getDiscoveriesAction(keyId?: string): Promise<ApiKeyDiscovery[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  let query = supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("discovered_at", { ascending: false })

  if (keyId) {
    query = query.eq("id", keyId)
  }

  const { data, error } = await query
  if (error) throw error

  return keysToCamel<ApiKeyDiscovery[]>(data || [])
}

export async function archiveDiscoveryAction(id: string): Promise<ApiKeyDiscovery> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("api_keys")
    .update({ is_archived: true })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  return keysToCamel<ApiKeyDiscovery>(data)
}

export async function deleteDiscoveryAction(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error
}
