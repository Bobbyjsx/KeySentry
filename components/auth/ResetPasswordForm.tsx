"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useResetPassword } from "@/hooks/data/useAuth/useAuth"
import { notifyServerError, isServerError } from "@/lib/server-error"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const resetPasswordMutation = useResetPassword()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const isLoading = resetPasswordMutation.isPending

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError(null)

    if (!token) {
      setError("Missing reset token. Please request a new password reset link.")
      toast.error("Missing reset token")
      return
    }

    resetPasswordMutation.mutate(
      { password: data.password, token },
      {
        onSuccess: (result) => {
          if (isServerError(result)) {
            const errMsg = notifyServerError(result)
            setError(Array.isArray(errMsg) ? errMsg[0] : errMsg)
            return
          }

          toast.success("Password updated successfully!")
          router.push("/login?reset=success")
        },
        onError: (err) => {
          setError("An unexpected error occurred")
          toast.error("An unexpected error occurred")
          console.error(err)
        }
      }
    )
  }

  return (
    <div className="w-full max-w-md p-8 bg-canvas-card border border-hairline rounded-sm space-y-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-24 -top-24 h-40 w-40 rounded-full bg-accent-sunset/10 blur-3xl pointer-events-none" />

      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-pill border border-hairline bg-canvas-soft p-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <span className="block text-caption-mono-sm font-mono uppercase text-gray-500">
          Account Security
        </span>
        <h1 className="text-display-xs font-normal text-white tracking-display-sm">
          Set New Password
        </h1>
        <p className="text-xs text-gray-400 max-w-xs mx-auto">
          Enter and verify your new account password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3.5 text-caption-mono-sm font-mono uppercase text-red-400 border border-red-500/20 bg-canvas-soft">
            {error}
          </div>
        )}

        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          label="New Password"
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

        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm New Password"
          required
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          rightNode={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center items-center space-x-2 w-full rounded-pill border border-white bg-white px-5 py-2.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
