import { Clock, Layers, Play, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { vetaTickets } from '@/lib/data'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const difficultyStyles: Record<string, string> = {
  Easy: 'bg-primary/15 text-primary',
  Medium: 'bg-amber-500/15 text-amber-400',
  Hard: 'bg-destructive/15 text-destructive',
}

export function VetaSection() {
  return (
    <section id="veta" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading eyebrow="Predict & win big" title="Veta Jackpots" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {vetaTickets.map((ticket) => (
          <article
            key={ticket.id}
            className="group glass relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all hover:border-primary/40"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="relative flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Trophy className="size-6" />
              </span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  difficultyStyles[ticket.difficulty],
                )}
              >
                {ticket.difficulty}
              </span>
            </div>

            <h3 className="relative mt-4 font-display text-lg font-bold">{ticket.title}</h3>

            <div className="relative mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="size-4" />
                {ticket.matches} matches
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {ticket.closesIn}
              </span>
            </div>

            <div className="relative mt-5 rounded-xl border border-border bg-secondary/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Jackpot Prize
              </p>
              <p className="mt-0.5 font-display text-xl font-extrabold text-primary">
                {ticket.jackpot}
              </p>
            </div>

            <Link href={`/veta?ticket=${ticket.id}`} className="relative mt-4">
              <Button size="lg" className="w-full gap-2 font-bold">
                <Play className="size-4" />
                Play Now
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
