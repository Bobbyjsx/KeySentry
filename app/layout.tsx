import AuthProvider from '@/components/auth/AuthProvider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KeySentry - Monitor and Detect Exposed API Keys',
  description: 'A Next.js application for monitoring and detecting exposed API keys across GitHub repositories.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
            <Toaster />
            <SonnerToaster richColors theme="dark" />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
