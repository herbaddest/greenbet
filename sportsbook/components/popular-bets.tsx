import { Flame, Users } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { popularBets } from '@/lib/data'

export function PopularBets() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading eyebrow="Trending now" title="Popular Bets" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {popularBets.map((bet) => (
          <article
            key={bet.match + bet.pick}
            className="group glass relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-primary/40"
          >
            <Flame className="absolute -right-3 -top-3 size-16 text-primary/10 transition-transform group-hover:scale-110" />
            <p className="text-xs font-medium text-muted-foreground">{bet.market}</p>
            <p className="mt-1 font-display text-lg font-bold leading-tight">{bet.pick}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{bet.match}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {bet.stakedBy} staked
              </span>
              <span className="rounded-lg bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                {bet.odds.toFixed(2)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
