"use server"

import { keysToCamel, keysToSnake } from "@/lib/case-transform"
import { encrypt, decrypt } from "@/lib/crypto"
import { getSettingsDAL, insertSettingsDAL, updateSettingsDAL } from "@/lib/dal/settings"
import { requireAuth } from "@/lib/auth-server"
import { z } from "zod"

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

const SettingsSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  emailAlerts: z.boolean().optional(),
  slackWebhook: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  githubToken: z.string().nullable().optional(),
  scanFrequency: z.enum(["hourly", "daily", "weekly", "monthly", "manual"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
})

export async function getSettings(): Promise<UserSettings | null> {
  const { user } = await requireAuth()

  const data = await getSettingsDAL(user.id)
  if (!data) {
    return null
  }

  const settings = keysToCamel<UserSettings>(data)
  if (settings.githubToken) {
    settings.githubToken = decrypt(settings.githubToken)
  }
  return settings
}

export interface SaveSettingsResult {
  success: boolean
  data?: UserSettings
  error?: string
}

export async function saveSettingsAction(settings: Partial<UserSettings>): Promise<SaveSettingsResult> {
  try {
    const { user } = await requireAuth()

    // Enforce schema validation
    const validatedSettings = SettingsSchema.parse(settings)

    // Normalize empty strings to null
    if (validatedSettings.slackWebhook === "") {
      validatedSettings.slackWebhook = null
    }

    const dbData = keysToSnake({
      ...validatedSettings,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    })

    if (dbData.github_token) {
      dbData.github_token = encrypt(dbData.github_token)
    }

    let res: UserSettings
    if (dbData.id) {
      const data = await updateSettingsDAL(user.id, dbData.id, dbData)
      res = keysToCamel<UserSettings>(data)
    } else {
      const data = await insertSettingsDAL(user.id, {
        ...dbData,
        created_at: new Date().toISOString(),
      })
      res = keysToCamel<UserSettings>(data)
    }

    if (res.githubToken) {
      res.githubToken = decrypt(res.githubToken)
    }

    return {
      success: true,
      data: res
    }
  } catch (err: any) {
    console.error("Error in saveSettingsAction:", err)
    let errorMessage = err.message || "Failed to save settings"
    if (err instanceof z.ZodError) {
      errorMessage = err.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    }
    return {
      success: false,
      error: errorMessage
    }
  }
}
