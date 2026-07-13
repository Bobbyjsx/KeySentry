import { createClient as createCookieClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export interface KeyPattern {
  id: string
  name: string
  provider: string
  regex: string
  flags: string
  riskLevel: "critical" | "high" | "medium" | "low"
  description: string
}

export async function getManagedPatterns(customSupabase?: any): Promise<KeyPattern[]> {
  try {
    let supabase = customSupabase
    if (!supabase) {
      try {
        supabase = await createCookieClient()
      } catch (err) {
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      }
    }
    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "patterns")
      .single()

    if (error) throw error

    if (data && Array.isArray(data.value)) {
      return data.value as KeyPattern[]
    }
    
    return []
  } catch (error) {
    console.error("Failed to read patterns from database:", error)
    return []
  }
}
