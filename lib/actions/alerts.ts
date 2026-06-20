"use server"

import { createClient } from "@/lib/supabase/server"
import { keysToCamel, keysToSnake } from "@/lib/case-transform"

export interface Alert {
  id: string
  userId: string
  apiKeyId: string | null
  title: string
  description: string
  severity: string
  isRead: boolean
  createdAt: string
}

export async function getAlertsAction(): Promise<Alert[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return keysToCamel<Alert[]>(data || [])
}

export async function markAlertAsReadAction(id: string): Promise<Alert> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("alerts")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error

  return keysToCamel<Alert>(data)
}
