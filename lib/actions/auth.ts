"use server";

import { api } from "../axios";
import { throwServerActionError } from "../server-error";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface AuthSignup {
  email: string;
  password: string;
  fullName: string;
}

export async function signupAction(request: AuthSignup) {
  try {
    const { data } = await api.post<AuthResponse>(
      "/api/v1/auth/signup",
      request,
    );
    return data;
  } catch (err) {
    return throwServerActionError(err);
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    const { data } = await api.post<{ success: boolean; message?: string }>(
      "/api/v1/auth/forgot-password",
      {
        email,
      },
    );
    return data;
  } catch (err) {
    return throwServerActionError(err);
  }
}

export async function resetPasswordAction(password: string, token: string) {
  try {
    const { data } = await api.post<{ success: boolean; message?: string }>(
      "/api/v1/auth/reset-password",
      {
        password,
        token,
      },
    );
    return data;
  } catch (err) {
    return throwServerActionError(err);
  }
}
