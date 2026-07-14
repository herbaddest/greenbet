import { AtSign, MessageCircle, Send, Share2 } from 'lucide-react'
import { Logo } from '@/components/logo'

// ============================================================
// SITE FOOTER
// Structured as: Learn More / Play / Contact Us columns, then a
// License + 18+ disclaimer strip, then copyright + socials —
// same pattern used by Kenyan sportsbooks (Betika, 1xBet, etc.)
//
// IMPORTANT: the license text below is a clearly-labeled PLACEHOLDER,
// not a real license number or regulator claim. GreenBet is a
// capstone/demo project, not an actually licensed gambling operator.
// Do NOT replace this with fabricated license numbers or a real
// regulatory body's name unless GreenBet is genuinely licensed —
// misrepresenting gambling licensing status is a serious legal issue,
// not just a copy-editing detail.
// ============================================================

const learnMoreLinks = [
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Responsible Gaming', href: '/responsible-gaming' },
  { label: 'Privacy Policy', href: '#' },
]

const playLinks = [
  { label: 'Sports', href: '/sports' },
  { label: 'Live Betting', href: '/live' },
  { label: 'Veta Jackpots', href: '/veta' },
  { label: 'Casino', href: '/casino' },
]

const socials = [
  { icon: Share2, label: 'X' },
  { icon: MessageCircle, label: 'WhatsApp' },
  { icon: AtSign, label: 'Instagram' },
  { icon: Send, label: 'Telegram' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Kenya&apos;s premium sportsbook for football, virtuals, Aviator and jackpots. Bet
              responsibly.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Learn More</h3>
            <ul className="mt-4 space-y-2.5">
              {learnMoreLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Play</h3>
            <ul className="mt-4 space-y-2.5">
              {playLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Contact Us</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Email</p>
                <a
                  href="mailto:support@greenbet.co.ke"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  support@greenbet.co.ke
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">WhatsApp</p>
                <a
                  href="https://wa.me/254789829537"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  +254 700 000 000
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* License + 18+ strip */}
        <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold">License</h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              [Placeholder] Licensing information will be published here once available. GreenBet
              does not currently hold a gambling license — replace this text with real license
              details from the relevant regulator before this goes live.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">18+</h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Must be 18 years of age or older to register or play at GreenBet. Gambling may have
              adverse effects if not done with moderation.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GreenBet. All rights reserved.
          </p>
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}