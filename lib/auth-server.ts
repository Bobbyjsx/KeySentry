import { cache } from "react"
import { auth } from "@/auth"

export const requireAuth = cache(async () => {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return { user: session.user, session }
})
