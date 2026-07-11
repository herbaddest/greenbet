"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OddsTicker } from '@/components/odds-ticker'
import { trustHighlights } from '@/lib/data'
import { useAuth } from '@/contexts/AuthContext'
import { getWallet } from '@/services/wallet.service'

export function HeroSection() {
  const router = useRouter()
  const { user } = useAuth()
  async function startBetting() {
    if (!user) return router.push('/register?next=/')
    const wallet = await getWallet(user.id)
    router.push(wallet.main > 0 ? '/#live' : '/wallet?intent=deposit&next=/')
  }
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-football.png"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28 lg:pb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Kenya&apos;s premium sportsbook
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Bet bigger. <span className="text-primary">Win faster.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Thousands of live markets, boosted odds and instant M-Pesa payouts. Football,
            Aviator, Veta jackpots and Spin &amp; Win — all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 px-7 text-base font-bold shadow-[0_0_30px] shadow-primary/30"
              onClick={startBetting}
            >
              Bet Now
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-12 gap-2 px-7 text-base font-semibold" onClick={() => router.push(user ? '/wallet?intent=deposit' : '/register?next=/')}>
              <Play className="size-4" />
              {user ? 'Deposit Now' : 'Create Account'}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {trustHighlights.map((h) => (
              <div key={h.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <h.icon className="size-4 text-primary" />
                {h.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 lg:mt-16">
          <OddsTicker />
        </div>
      </div>
    </section>
  )
}
