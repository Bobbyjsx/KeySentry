import { auth, unstable_update } from "@/auth";
import axios, { InternalAxiosRequestConfig } from "axios";

export const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Main API client
export const api = axios.create({
  baseURL,
});

import { keysToCamel, keysToSnake } from "./case-transform";

// Dedicated client for token refresh to avoid recursive interceptor loops
const refreshClient = axios.create({
  baseURL,
});

export interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use(
  async (config) => {
    try {
      const session = await auth();
      const token = session?.accessToken;

      // Ensure headers object exists
      config.headers = config.headers || {};

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const atlasKey = process.env.ATLAS_API_KEY || "";
      if (atlasKey) {
        config.headers.set("X-Atlas-Api-Key", atlasKey);
      }

      if (config.data) {
        config.data = keysToSnake(config.data);
      }
      if (config.params) {
        config.params = keysToSnake(config.params);
      }
    } catch (e) {
      console.error("Failed to attach auth headers in Axios interceptor:", e);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Global state for request queueing.
// Note: In serverless environments (Vercel functions, etc.), this state is per-instance.
// Concurrent requests across different instances will independently refresh tokens,
// which is a known architectural limitation of serverless environments.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = keysToCamel(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const session = await auth();
        const refreshToken =
          (session?.user as any)?.refreshToken ||
          (session?.user as any)?.refresh_token;

        if (refreshToken) {
          // Use the dedicated refresh client to avoid interceptor loops
          const res = await refreshClient.post(`/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (res.data?.access_token) {
            const newAccessToken = res.data.access_token;
            const newRefreshToken = res.data.refresh_token || refreshToken;

            // Update NextAuth session natively
            if (typeof unstable_update === "function" && session) {
              await unstable_update({
                user: {
                  ...session.user,
                  accessToken: newAccessToken,
                  refreshToken: newRefreshToken,
                },
              });
            }

            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Token refresh failed in interceptor.");
        // redirect("/api/auth/signout");
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
