'use client'
import { createClient } from '@/lib/supabase/component'
import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import LoadingPage from './LoadingPage'

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
  const pathname = usePathname()
  const router = useRouter()

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
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
          router.refresh()
        }
      }
    )

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const isAuthPath = pathname?.startsWith('/auth')
  const isProtectedPath = pathname !== '/' && !isAuthPath
  const showLoading = isLoading || (!session && isProtectedPath)

  const value = {
    supabase,
    session,
    user,
    isLoading: showLoading,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {showLoading ? <LoadingPage /> : children}
    </SupabaseContext.Provider>
  )
}
