import { SectionHeading } from '@/components/section-heading'
import { sports } from '@/lib/data'

export function PopularSports() {
  return (
    <section id="sports" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading eyebrow="Explore" title="Popular Sports" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sports.map((sport) => (
          <a
            key={sport.name}
            href="#live"
            className="group glass flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <sport.icon className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold">{sport.name}</p>
              <p className="text-xs text-muted-foreground">
                {sport.events.toLocaleString()} events
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
