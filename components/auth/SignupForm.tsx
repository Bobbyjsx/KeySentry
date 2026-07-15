"use client";

import { Input } from "@/components/ui/input";
import { useSignup } from "@/hooks/data/useAuth/useAuth";
import { isServerError, notifyServerError } from "@/lib/server-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    full_name: z.string().min(1, "Full Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = signupMutation.isPending;

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);

    signupMutation.mutate(data as any, {
      onSuccess: async (result) => {
        if (isServerError(result)) {
          const errMsg = notifyServerError(result);
          setError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
          return;
        }

        toast.success("Account created successfully!");

        // Automatically log them in after signup using NextAuth
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error(
            "Signup successful, but failed to log in automatically. Please log in.",
          );
          router.push("/auth/login");
        } else {
          router.push("/");
          router.refresh();
        }
      },
      onError: (err) => {
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
        console.error(err);
      },
    });
  };

  return (
    <div className="w-full max-w-md p-8 bg-canvas-card border border-hairline rounded-sm space-y-8 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-24 -top-24 h-40 w-40 rounded-full bg-accent-twilight/10 blur-3xl pointer-events-none" />

      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-pill border border-hairline bg-canvas-soft p-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <span className="block text-caption-mono-sm font-mono uppercase text-gray-500">
          Register Scanner Account
        </span>
        <h1 className="text-display-xs font-normal text-white tracking-display-sm">
          Create KeySentry Account
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
        <Input
          id="full_name"
          type="text"
          label="Full Name"
          required
          placeholder="John Doe"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password"
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
          label="Confirm Password"
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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </div>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-caption-mono-sm font-mono uppercase text-gray-400 hover:text-white transition-colors underline pl-1"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
