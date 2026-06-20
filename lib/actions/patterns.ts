"use server"

import { requireAuth } from "@/lib/auth-server"
import { getManagedPatterns, type KeyPattern } from "@/lib/core/patterns-registry"

export async function getPatternsAction(): Promise<KeyPattern[]> {
  await requireAuth()
  return await getManagedPatterns()
}
