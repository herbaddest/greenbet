"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Mail, MessageCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================
// HELP CENTER
// Self-contained FAQ accordion (no shadcn Accordion dependency —
// only button.tsx is installed in components/ui/ right now, so
// this uses plain useState instead of pulling in a new component
// just for this page). Matches existing design tokens (glass,
// border-border, text-primary, etc.) rather than introducing new
// colors.
// ============================================================

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  id: string
  label: string
  items: FaqItem[]
}

const CATEGORIES: FaqCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    items: [
      {
        question: "How do I create a GreenBet account?",
        answer:
          "Tap Register, enter your phone number and email, set a password, and verify your phone number with the code we send you. You can start browsing odds immediately — you'll only need to complete KYC before your first withdrawal.",
      },
      {
        question: "Is GreenBet available outside Kenya?",
        answer:
          "GreenBet is built primarily for the Kenyan market, with KES as the default currency and M-Pesa as the primary payment method. Availability in other regions depends on local regulations.",
      },
      {
        question: "Do I need to verify my identity?",
        answer:
          "Yes — KYC verification (a valid ID and a selfie) is required before your first withdrawal, in line with standard betting industry compliance. You can deposit and place bets before completing this step.",
      },
    ],
  },
  {
    id: "deposits-withdrawals",
    label: "Deposits & Withdrawals",
    items: [
      {
        question: "What payment methods are supported?",
        answer:
          "M-Pesa is the primary method for deposits and withdrawals. Bank transfer and card payments may also be available depending on your account region.",
      },
      {
        question: "How long do withdrawals take?",
        answer:
          "M-Pesa withdrawals are typically processed within a few minutes once approved. Delays can happen during KYC review or unusually high request volume.",
      },
      {
        question: "Is there a minimum deposit or withdrawal amount?",
        answer:
          "Yes, minimums apply to keep transaction fees reasonable — check the Wallet page for the current minimum deposit and withdrawal thresholds.",
      },
    ],
  },
  {
    id: "betting-odds",
    label: "Betting & Odds",
    items: [
      {
        question: "Why did my odds change after I selected them?",
        answer:
          "Odds move in real time based on market activity, just like any sportsbook — if a match hasn't kicked off yet and enough time passes, the price on your bet slip may update to reflect the latest odds before you place the bet.",
      },
      {
        question: "What's the difference between a single and a multiple bet?",
        answer:
          "A single bet places one stake on one selection. A multiple (accumulator) combines several selections into one bet — all selections must win for the bet to pay out, but the combined odds multiply together for a bigger potential return.",
      },
      {
        question: "Can I cancel a bet after placing it?",
        answer:
          "Once a bet is placed and confirmed, it generally can't be cancelled — this is standard across sportsbooks, since your stake is immediately matched against the odds offered at that moment.",
      },
    ],
  },
  {
    id: "responsible-gambling",
    label: "Responsible Gambling",
    items: [
      {
        question: "How do I set a deposit limit?",
        answer:
          "Go to Responsible Gaming in your account settings to set daily, weekly, or monthly deposit limits. Once set, limits can only be increased after a cooling-off period — this is a protective measure, not a bug.",
      },
      {
        question: "Can I take a break from betting?",
        answer:
          "Yes — the Responsible Gaming page lets you set a temporary cool-off period or a longer self-exclusion. During this time you won't be able to deposit or place bets.",
      },
      {
        question: "Where can I get help if betting feels like a problem?",
        answer:
          "If gambling is affecting your life negatively, reach out to a local support service in Kenya such as GamCare-style helplines, or contact our support team who can help you set limits or self-exclude.",
      },
    ],
  },
  {
    id: "account-security",
    label: "Account & Security",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          "Use the Forgot Password link on the login page — we'll send a reset code to your registered phone number or email.",
      },
      {
        question: "Is my personal and payment information secure?",
        answer:
          "Yes — account credentials and payment details are handled through Supabase Authentication and encrypted in transit. We never store your M-Pesa PIN.",
      },
    ],
  },
]

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold">{item.question}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180 text-primary"
          )}
        />
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
          {item.answer}
        </p>
      )}
    </div>
  )
}

export default function HelpCenterPage() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id)

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return CATEGORIES
    const q = query.toLowerCase()
    return CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0)
  }, [query])

  const visibleCategory =
    filteredCategories.find((c) => c.id === activeCategory) ?? filteredCategories[0]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Help Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Answers to common questions about your account, deposits, betting, and staying in control.
        </p>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a topic, e.g. withdrawal, deposit limit..."
            className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </div>

        {/* Category tabs (hidden while searching, since search flattens across all categories) */}
        {!query && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* FAQ list */}
        <div className="mt-6 space-y-6 pb-10">
          {query ? (
            filteredCategories.length === 0 ? (
              <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">
                No results for &quot;{query}&quot;. Try a different search term or contact support below.
              </p>
            ) : (
              filteredCategories.map((cat) => (
                <div key={cat.id}>
                  <h3 className="mb-3 text-sm font-bold text-muted-foreground">{cat.label}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, i) => (
                      <FaqRow key={i} item={item} />
                    ))}
                  </div>
                </div>
              ))
            )
          ) : visibleCategory ? (
            <div className="space-y-2">
              {visibleCategory.items.map((item, i) => (
                <FaqRow key={i} item={item} />
              ))}
            </div>
          ) : null}
        </div>

        {/* Contact support */}
        <div className="glass mb-16 rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold">Still need help?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Our support team is available for anything not covered above.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:support@greenbet.co.ke"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-semibold transition-colors hover:border-primary/50"
            >
              <Mail className="size-4" />
              support@greenbet.co.ke
            </a>
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}