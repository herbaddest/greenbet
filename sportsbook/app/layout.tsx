import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Sora } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { BetSlipProvider } from "@/contexts/BetSlipContext"

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'GreenBet — Premium Sports Betting in Kenya',
  description:
    'Bet on football, basketball, tennis, virtuals, Aviator and daily jackpots. Fast M-Pesa payouts, live odds and Spin & Win rewards.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#090909',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
  <html lang="en" className={`${geistSans.variable} ${sora.variable} bg-background`}>
    <body className="font-sans antialiased">
      <Providers>
        <BetSlipProvider>
          {children}
        </BetSlipProvider>
      </Providers>

      {process.env.NODE_ENV === "production" && <Analytics />}
    </body>
  </html>
)
}
