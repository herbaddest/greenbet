import type { ReactNode } from 'react'

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}
