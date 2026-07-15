"use server"

import { z } from "zod"
import { api } from "@/lib/axios"

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

import { throwServerActionError } from "../server-error"

export async function getSettingsAction(): Promise<UserSettings> {
  try {
    const { data } = await api.get("/api/v1/settings")
    return data
  } catch (err) {
    console.error("Error in getSettingsAction:", err)
    return {
      emailAlerts: true,
      slackWebhook: null,
      githubToken: null,
      scanFrequency: "daily",
      theme: "dark",
    }
  }
}

export async function saveSettingsAction(settings: Partial<UserSettings>) {
  try {
    const validatedSettings = SettingsSchema.parse(settings)

    if (validatedSettings.slackWebhook === "") {
      validatedSettings.slackWebhook = null
    }

    const { data } = await api.patch("/api/v1/settings", validatedSettings)

    return data
  } catch (err) {
    console.error("Error in saveSettingsAction:", err)
    return throwServerActionError(err)
  }
}
