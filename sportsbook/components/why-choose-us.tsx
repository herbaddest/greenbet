import { SectionHeading } from '@/components/section-heading'
import { features } from '@/lib/data'

export function WhyChooseUs() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="Why GreenBet" title="Built for winners" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/40"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
