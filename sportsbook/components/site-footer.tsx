import { AtSign, MessageCircle, Send, Share2 } from 'lucide-react'
import { Logo } from '@/components/logo'

const footerLinks = [
  {
    title: 'Company',
    links: ['About', 'Contact', 'Careers', 'Affiliates'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms & Conditions', 'Responsible Gaming', 'AML Policy'],
  },
  {
    title: 'Help',
    links: ['FAQ', 'How to Bet', 'Deposits & Withdrawals', 'Live Support'],
  },
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
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Kenya&apos;s premium sportsbook for football, virtuals, Aviator and jackpots. Bet
              responsibly.
            </p>
            <div className="mt-5 flex gap-2">
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

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-primary/40 px-2 py-1 text-xs font-bold text-primary">
              18+
            </span>
            <p className="text-xs text-muted-foreground">
              Gambling can be addictive. Play responsibly. Licensed by the BCLB.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GreenBet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
