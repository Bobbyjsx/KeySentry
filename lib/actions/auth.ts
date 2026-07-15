"use server";

import { api } from "../axios";
import { throwServerActionError } from "../server-error";

type SignUpResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
};

export async function signupAction(email: string, password: string) {
  try {
    const { data } = await api.post<SignUpResponse>("/api/v1/auth/signup", {
      email,
      password,
    });
    return data;
  } catch (err) {
    return throwServerActionError(err);
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    const { data } = await api.post<{ success: boolean; message?: string }>("/api/v1/auth/forgot-password", {
      email,
    });
    return data;
  } catch (err) {
    return throwServerActionError(err);
  }
}

export async function resetPasswordAction(password: string, token: string) {
  try {
    const { data } = await api.post<{ success: boolean; message?: string }>("/api/v1/auth/reset-password", {
      password,
      token,
    });
    return data;
  } catch (err) {
    return throwServerActionError(err);
  }
}
