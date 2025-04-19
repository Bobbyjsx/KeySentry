'use client'
import { createClient } from '@/lib/supabase/component'
import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

// Create context types
type SupabaseContextType = {
  supabase: ReturnType<typeof createClient>
  session: Session | null
  user: User | null
  isLoading: boolean
}

// Create context with default values
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: createClient(),
  session: null,
  user: null,
  isLoading: true,
})

// Hook to use the Supabase context
export const useSupabase = () => useContext(SupabaseContext)

// Provider component
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setIsLoading(true)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    supabase,
    session,
    user,
    isLoading,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
