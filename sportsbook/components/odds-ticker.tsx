import { TrendingUp } from 'lucide-react'
import { oddsTicker } from '@/lib/data'

export function OddsTicker() {
  const items = [...oddsTicker, ...oddsTicker]

  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card/60 py-2.5 backdrop-blur">
      <span className="z-10 ml-3 flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
        <TrendingUp className="size-3.5" />
        LIVE ODDS
      </span>
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex shrink-0 animate-ticker items-center gap-6 pr-6">
          {items.map((item, i) => (
            <span key={i} className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">{item.split(' • ')[0]}</span>
              <span className="font-semibold text-primary">{item.split(' • ')[1]}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
