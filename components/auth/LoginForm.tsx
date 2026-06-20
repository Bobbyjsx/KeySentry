"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSupabase } from "./AuthProvider"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginForm() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.refresh()
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
      <div className="absolute -right-24 -top-24 h-40 w-40 rounded-full bg-accent-dusk/10 blur-3xl pointer-events-none" />

      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-pill border border-hairline bg-canvas-soft p-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <span className="block text-caption-mono-sm font-mono uppercase text-gray-500">
          Secure Access Portal
        </span>
        <h1 className="text-display-xs font-normal text-white tracking-display-sm">
          Sign In to KeySentry
        </h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-3.5 text-caption-mono-sm font-mono uppercase text-red-400 border border-red-500/20 bg-canvas-soft">
            {error}
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-caption-mono-sm font-mono uppercase text-gray-400">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-caption-mono-sm font-mono uppercase text-gray-500 hover:text-white transition-colors">
              Forgot?
            </Link>
          </div>
          
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-3.5 pr-10 py-2.5 rounded-sm border border-hairline bg-canvas-soft text-sm text-white placeholder-gray-600 outline-none focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          New to KeySentry?{" "}
          <Link href="/auth/signup" className="text-caption-mono-sm font-mono uppercase text-gray-400 hover:text-white transition-colors underline pl-1">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}
