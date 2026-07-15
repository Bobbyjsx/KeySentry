import type { AuthSignup } from "@/lib/actions/auth";
import {
  forgotPasswordAction,
  resetPasswordAction,
  signupAction,
} from "@/lib/actions/auth";
import { useMutation } from "@tanstack/react-query";

export function useSignup() {
  return useMutation({
    mutationFn: (request: AuthSignup) => signupAction(request),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordAction(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ password, token }: { password: string; token: string }) =>
      resetPasswordAction(password, token),
  });
}
