import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#" className={cn('flex items-center gap-2', className)} aria-label="GreenBet home">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <path
            d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z"
            fill="currentColor"
            opacity="0.25"
          />
          <path
            d="m8 12 2.5 2.5L16 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">
        Green<span className="text-primary">Bet</span>
      </span>
    </a>
  )
}
