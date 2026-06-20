import { createClient } from "@/lib/supabase/server"

export interface KeyPattern {
  id: string
  name: string
  provider: string
  regex: string
  flags: string
  riskLevel: "critical" | "high" | "medium" | "low"
  description: string
}

export async function getManagedPatterns(): Promise<KeyPattern[]> {
  try {
    const supabase = await createClient()
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
