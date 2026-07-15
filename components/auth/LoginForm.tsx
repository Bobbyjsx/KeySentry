"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setError("Invalid email or password")
        toast.error("Invalid email or password")
        return
      }

      toast.success("Successfully authenticated")
      router.push("/")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      toast.error("An unexpected error occurred")
      console.error(err)
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3.5 text-caption-mono-sm font-mono uppercase text-red-400 border border-red-500/20 bg-canvas-soft">
            {error}
          </div>
        )}

        <Input
          id="email"
          type="email"
          label="Email Address"
          required
          placeholder="name@domain.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-caption-mono-sm font-mono uppercase text-gray-400">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-caption-mono-sm font-mono uppercase text-gray-500 hover:text-white transition-colors">
              Forgot?
            </Link>
          </div>
          
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
            rightNode={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex justify-center items-center space-x-2 w-full rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
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
