# Supabase Authentication Implementation

This document outlines the modern Supabase authentication architecture implemented in the KeySentry project.

## Architecture Overview

The authentication system follows a modern Next.js App Router approach with Supabase's latest SSR (Server-Side Rendering) capabilities.

### Key Components

1. **Client-Side Authentication**
   - `AuthProvider.tsx`: Context provider for authentication state
   - Login, Signup, Password Reset components
   - Client-side Supabase instance with proper cookie handling

2. **Server-Side Authentication**
   - Server component authentication with `createServerSupabaseClient`
   - Auth helpers for protecting routes and checking session state
   - Middleware for route protection and session refresh

3. **Auth Flow**
   - Email/password authentication
   - Password reset functionality
   - Auth callback handling for email verification

## File Structure

```
/components/auth/
  ├── AuthProvider.tsx       # Auth context provider
  ├── LoginForm.tsx         # Login form component
  ├── SignupForm.tsx        # Signup form component
  ├── LogoutButton.tsx      # Logout button component
  ├── ForgotPasswordForm.tsx # Password reset request form
  └── ResetPasswordForm.tsx # Password reset form

/lib/
  ├── auth.ts               # Auth helper functions
  ├── supabase-client.ts    # Browser client configuration
  └── supabase-server.ts    # Server client configuration

/app/
  ├── auth/
  │   └── callback/
  │       └── route.ts      # Auth callback handler
  ├── login/
  │   └── page.tsx          # Login page
  ├── signup/
  │   └── page.tsx          # Signup page
  ├── forgot-password/
  │   └── page.tsx          # Forgot password page
  ├── reset-password/
  │   └── page.tsx          # Reset password page
  └── dashboard/
      └── page.tsx          # Protected dashboard page

/middleware.ts              # Auth middleware for route protection
```

## Authentication Flow

1. User signs up or logs in through the respective forms
2. Supabase handles authentication and sets secure cookies
3. Middleware validates the session on protected routes
4. Server components can access the user session securely
5. Client components use the AuthProvider context for auth state

## Security Considerations

- Secure cookie handling for authentication
- Server-side session validation
- Protected routes with middleware
- Service role key used only on the server
- Email verification for new accounts

# Agent Supabase Local Credentials

Email: agent@keysentry.ai
Password: SuperSecureAgentPassword123!
User ID: d0a86337-77f9-451e-aa1b-ab1cc7f9e619
Date Created: 2026-06-20
Supabase API URL: http://127.0.0.1:54321
Supabase Anon Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# KeySentry Project Standards

This section outlines the standards and architecture required for the KeySentry application.

---

## 🏗️ Core Way of Working

All data fetching and mutations must follow this strict pattern:
1. **UI Component:** Never calls server actions directly. Uses a custom TanStack React Query hook.
2. **Custom Hook (`hooks/data/use[Domain]/[resource].ts`):** Uses React Query (`useQuery`, `useMutation`) for caching and state management, and wraps the Server Action.
3. **Server Action (`lib/actions/[domain].ts`):** Acts as the bridge to the Python backend API.
4. **Global API Client (`lib/axios.ts`):** Server Actions must ONLY use the globally configured `api` Axios instance. DO NOT create custom fetch wrappers or `fetchApi` utilities. The global Axios client automatically injects the necessary Auth Bearer tokens (via NextAuth) and Atlas keys via request interceptors, and it intercepts responses to refresh tokens on 401s and handle logouts.

**Rule:** DO NOT use direct `fetch()` calls or intermediate fetch wrappers. All backend communication goes through the global `axios` instance in Server Actions, which are then consumed exclusively by React Query hooks in the UI.

---

## 🔄 Name Conversions

- **Database:** Use `snake_case` (like `short_code`).
- **App/Frontend:** Use `camelCase` (like `shortCode`).
- **How to convert:** 
  - All Server Actions must return `camelCase`.
  - The UI must only use `camelCase`.

---

## 🛠️ Reusable Parts

Look for existing components in `components/ui` before making something new.

## ⚠️ Code Quality

1. **No "any":** Always use proper TypeScript types.
2. **Popups:** Use **Sonner** toasts (`toast.success` or `toast.error`) instead of alerts.

