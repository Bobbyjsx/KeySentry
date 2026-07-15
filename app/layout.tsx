import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

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
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} font-sans bg-canvas text-white antialiased`}>
        <SessionProvider>
          <Providers>
            {children}
            <Toaster />
            <SonnerToaster richColors theme="dark" />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
