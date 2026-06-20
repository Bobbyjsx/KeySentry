"use client"

import Link from "next/link"
import { useState } from "react"
import { useSupabase } from "./AuthProvider"
import { Shield, Key, Loader2, Sparkles } from "lucide-react"

export default function ForgotPasswordForm() {
  const { supabase } = useSupabase()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage("Check your email for the password reset link")
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-canvas-card border border-hairline rounded-sm space-y-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-24 -top-24 h-40 w-40 rounded-full bg-accent-sunset/10 blur-3xl pointer-events-none" />

      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-pill border border-hairline bg-canvas-soft p-3">
            <Key className="h-6 w-6 text-white" />
          </div>
        </div>
        <span className="block text-caption-mono-sm font-mono uppercase text-gray-500">
          Password Recovery
        </span>
        <h1 className="text-display-xs font-normal text-white tracking-display-sm">
          Reset Your Password
        </h1>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          We'll send you an email with a secure link to reset your account password.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        {error && (
          <div className="p-3.5 text-caption-mono-sm font-mono uppercase text-red-400 border border-red-500/20 bg-canvas-soft">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3.5 text-caption-mono-sm font-mono uppercase text-accent-breeze border border-accent-breeze/20 bg-canvas-soft flex items-start space-x-2">
            <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-caption-mono-sm font-mono uppercase text-gray-400">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            className="block w-full px-3.5 py-2.5 rounded-sm border border-hairline bg-canvas-soft text-sm text-white placeholder-gray-600 outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center items-center space-x-2 w-full rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </div>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-caption-mono-sm font-mono uppercase text-gray-400 hover:text-white transition-colors underline pl-1">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
