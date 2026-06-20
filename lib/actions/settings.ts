"use server"

import { createClient } from "@/lib/supabase/server"
import { keysToCamel, keysToSnake } from "@/lib/case-transform"

export interface UserSettings {
  id?: string
  userId?: string
  emailAlerts: boolean
  slackWebhook: string | null
  githubToken: string | null
  scanFrequency: string
  theme: string
  createdAt?: string
  updatedAt?: string
}

export async function getSettings(): Promise<UserSettings | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw error
  }

  return keysToCamel<UserSettings>(data)
}

export async function saveSettingsAction(settings: Partial<UserSettings>): Promise<UserSettings> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const dbData = keysToSnake({
    ...settings,
    userId: user.id,
    updatedAt: new Date().toISOString(),
  })

  if (dbData.id) {
    const { data, error } = await supabase
      .from("user_settings")
      .update(dbData)
      .eq("id", dbData.id)
      .select()
      .single()

    if (error) throw error
    return keysToCamel<UserSettings>(data)
  } else {
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        ...dbData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return keysToCamel<UserSettings>(data)
  }
}
