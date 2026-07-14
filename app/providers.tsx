"use client"

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/component"

let isRedirecting = false

const handleUnauthorized = () => {
  if (isRedirecting) return
  isRedirecting = true

  const supabase = createClient()
  supabase.auth.signOut().finally(() => {
    toast.error("Your session has expired. Redirecting to login...")
    setTimeout(() => {
      window.location.href = "/auth/login"
    }, 1500)
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            if (error?.message === "Unauthorized") {
              handleUnauthorized()
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            if (error?.message === "Unauthorized") {
              handleUnauthorized()
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => {
              // Don't retry if unauthorized or 404
              if (error?.message === "Unauthorized") return false
              if (error?.status === 404) return false
              // Only retry 3 times
              return failureCount < 3
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
          },
          mutations: {
            retry: (failureCount, error: any) => {
              if (error?.message === "Unauthorized") return false
              return false // Don't auto-retry mutations by default
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
