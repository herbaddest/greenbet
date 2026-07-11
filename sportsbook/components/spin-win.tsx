import Image from 'next/image'
import Link from 'next/link'
import { Gift, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const prizes = ['KSh 50,000 Cash', 'Free Spins x10', 'Odds Boost +50%', 'Free Bet KSh 1,000']

export function SpinWin() {
  return (
    <section id="spin" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card p-6 sm:p-10 lg:p-14">
        <div className="absolute -left-24 top-1/2 size-72 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              Daily free reward
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-balance sm:text-4xl lg:text-5xl">
              Spin &amp; Win <span className="text-primary">every day</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Log in daily for a free spin of the wheel. Win cash, free bets, odds boosts and more —
              instantly credited to your account.
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {prizes.map((prize) => (
                <li key={prize} className="flex items-center gap-2 text-sm">
                  <Gift className="size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{prize}</span>
                </li>
              ))}
            </ul>

            <Link href="/spin">
              <Button
                size="lg"
                className="mt-8 h-12 gap-2 px-8 text-base font-bold shadow-[0_0_30px] shadow-primary/30"
              >
                <Sparkles className="size-4" />
                Spin Now
              </Button>
            </Link>
          </div>

          <div className="relative mx-auto flex max-w-sm items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl" />
            <Image
              src="/spin-wheel.png"
              alt="Prize spin wheel with emerald, gold and black segments"
              width={480}
              height={480}
              className="relative w-full animate-spin-slow drop-shadow-2xl"
            />
            <div
              className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary shadow-lg"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  )
}
