"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Play, Flame, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OddsTicker } from "@/components/odds-ticker"
import { trustHighlights } from "@/lib/data"
import { useAuth } from "@/contexts/AuthContext"
import { getWallet } from "@/services/wallet.service"

export function HeroSection() {
  const router = useRouter()
  const { user } = useAuth()

  async function startBetting() {
    if (!user) return router.push("/register?next=/")

    const wallet = await getWallet(user.id)

    router.push(
      wallet.main > 0
        ? "/#live"
        : "/wallet?intent=deposit&next=/"
    )
  }

  return (
    <section className="relative overflow-hidden">

      <div className="absolute inset-0 -z-10">

        <Image
          src="/hero-football.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

        {/* subtle grain so the dark surface doesn't read as a flat gradient */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pt-16 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-28 lg:pb-20">

        {/* LEFT */}

        <div className="max-w-2xl">

          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Kenya&rsquo;s Premium Sportsbook
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Bet bigger.<br />
            <span className="relative inline-block bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent">
              Win faster.
              <span className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent bg-clip-text text-transparent [animation:shimmer_2.5s_ease-in-out_1]" />
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Thousands of live markets, boosted odds and instant M-Pesa payouts.
            Football, Aviator, Veta jackpots and Spin & Win — all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <Button
              size="lg"
              onClick={startBetting}
              className="group h-12 px-7 text-base font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,230,118,.6)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Bet Now
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 border-white/15 transition-colors duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() =>
                router.push(
                  user
                    ? "/wallet?intent=deposit"
                    : "/register?next=/"
                )
              }
            >
              <Play className="mr-2 size-4" />
              {user ? "Deposit Now" : "Create Account"}
            </Button>

          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">

            {trustHighlights.map((h) => (
              <div
                key={h.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <h.icon className="size-4 text-primary" />
                {h.label}
              </div>
            ))}

          </div>

        </div>

        {/* RIGHT */}

        <div className="relative hidden lg:flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">

          {/* Glow, tucked behind the card rather than centered under everything */}

          <div className="absolute h-[360px] w-[360px] translate-y-4 rounded-full bg-primary/25 blur-[120px]" />

          {/* Floating badges — staggered fade-up instead of infinite bounce */}

          <div
            className="absolute left-0 top-6 z-10 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-2 text-sm font-semibold shadow-xl [animation:fadeUp_0.6s_ease-out_0.1s_both]"
          >
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-red-500 animate-pulse align-middle" />
            LIVE
          </div>

          <div
            className="absolute -right-2 top-24 z-10 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-2 text-sm font-semibold shadow-xl [animation:fadeUp_0.6s_ease-out_0.3s_both]"
          >
            Over 2.5
          </div>

          <div
            className="absolute bottom-6 right-8 z-10 rounded-xl border border-primary/30 bg-zinc-900/95 px-4 py-2 text-sm font-semibold text-primary shadow-xl [animation:fadeUp_0.6s_ease-out_0.5s_both]"
          >
            +2.35 Odds
          </div>

          {/* Match Card */}

          <div className="relative w-[420px] rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                LIVE
              </span>

              <span className="text-sm text-zinc-400">
                85&rsquo;
              </span>

            </div>

            <div className="mt-8">

              <h3 className="text-2xl font-bold">
                Arsenal vs Chelsea
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                English Premier League
              </p>

            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">

              <button
                aria-label="Bet on Arsenal to win, odds 2.30"
                className="rounded-xl bg-zinc-800 py-4 text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-black hover:shadow-[0_0_25px_rgba(0,230,118,.7)] active:translate-y-0"
              >
                2.30
              </button>

              <button
                aria-label="Bet on draw, odds 3.10"
                className="rounded-xl bg-zinc-800 py-4 text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-black hover:shadow-[0_0_25px_rgba(0,230,118,.7)] active:translate-y-0"
              >
                3.10
              </button>

              <button
                aria-label="Bet on Chelsea to win, odds 2.75"
                className="rounded-xl bg-zinc-800 py-4 text-lg font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-black hover:shadow-[0_0_25px_rgba(0,230,118,.7)] active:translate-y-0"
              >
                2.75
              </button>

            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm text-zinc-400">

              <span className="flex items-center gap-1.5">
                <Flame className="size-4 text-orange-400" />
                24,531 Bets
              </span>

              <span className="flex items-center gap-1.5">
                <Trophy className="size-4 text-primary" />
                KSh 2M Won Today
              </span>

            </div>

          </div>

        </div>

        {/* Ticker */}

        <div className="mt-12 lg:col-span-2">
          <OddsTicker />
        </div>

      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          15% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(120%) skewX(-12deg); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

    </section>
  )
}