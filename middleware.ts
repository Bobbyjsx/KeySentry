import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((request) => {
  const session = request.auth
  
  const protectedRoutes = ['/settings', '/api-keys', '/scan', '/discoveries', '/alerts', '/analytics']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    if (request.nextUrl.pathname !== redirectUrl.pathname) {
      return NextResponse.redirect(redirectUrl)
    }
  }

  const authRoutes = ['/login', '/auth', '/register']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && session) {
    const redirectUrl = new URL('/', request.url)
    if (request.nextUrl.pathname !== redirectUrl.pathname) {
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}
