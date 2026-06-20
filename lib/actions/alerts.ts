"use server"

import { keysToCamel } from "@/lib/case-transform"
import { getAlertsDAL, markAlertAsReadDAL, getUnreadAlertsCountDAL } from "@/lib/dal/alerts"
import { requireAuth } from "@/lib/auth-server"

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
  const { user } = await requireAuth()
  const data = await getAlertsDAL(user.id)
  return keysToCamel<Alert[]>(data)
}

export async function markAlertAsReadAction(id: string): Promise<Alert> {
  const { user } = await requireAuth()
  const data = await markAlertAsReadDAL(user.id, id)
  return keysToCamel<Alert>(data)
}

export async function getUnreadAlertsCountAction(): Promise<number> {
  try {
    const { user } = await requireAuth()
    return await getUnreadAlertsCountDAL(user.id)
  } catch {
    return 0
  }
}
