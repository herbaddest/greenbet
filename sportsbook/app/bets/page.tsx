"use client"

import { ChevronDown, ReceiptText } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/contexts/AuthContext"
import { getBetHistory } from "@/services/bet.service"
import { formatKes } from "@/services/wallet.service"
import type { PlacedBet } from "@/types"

const tabs = ["Open", "Won", "Lost", "Settled", "Cash Out"] as const
export default function BetsPage() {
  const { user, isLoading } = useAuth(); const router = useRouter(); const [active, setActive] = useState<(typeof tabs)[number]>("Open"); const [bets, setBets] = useState<PlacedBet[]>([]); const [expanded, setExpanded] = useState<string | null>(null)
  useEffect(() => { if (!isLoading && !user) router.replace("/login?next=/bets"); if (user) void getBetHistory(user.id).then(setBets) }, [isLoading, router, user])
  const visible = bets.filter((bet) => active === "Settled" ? bet.status !== "open" : active === "Cash Out" ? bet.status === "cashed_out" : bet.status === active.toLowerCase())
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><p className="text-xs font-semibold uppercase tracking-wider text-primary">My account</p><h1 className="mt-1 font-display text-3xl font-bold">Bet History</h1><div className="mt-6 flex gap-2 overflow-x-auto">{tabs.map((tab) => <button key={tab} onClick={() => setActive(tab)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${active === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{tab}</button>)}</div><div className="mt-5 space-y-3">{visible.length ? visible.map((bet) => <article key={bet.id} className="glass overflow-hidden rounded-xl"><button onClick={() => setExpanded(expanded === bet.id ? null : bet.id)} className="flex w-full items-center justify-between gap-4 p-4 text-left"><div><p className="font-semibold">{bet.selections[0]?.marketName === "Veta Jackpot" ? "Veta Jackpot Ticket" : `${bet.selections.length} selection${bet.selections.length === 1 ? "" : "s"}`}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(bet.placedAt).toLocaleString("en-KE")}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-bold">{formatKes(bet.stake)}</p><p className="text-xs capitalize text-primary">{bet.status.replace("_", " ")}</p></div><ChevronDown className={`size-4 transition-transform ${expanded === bet.id ? "rotate-180" : ""}`} /></div></button>{expanded === bet.id && <div className="border-t border-border bg-secondary/20 p-4"><div className="space-y-2">{bet.selections.map((selection) => <div key={selection.id} className="flex justify-between gap-3 text-sm"><span className="truncate text-muted-foreground">{selection.matchLabel}</span><b className="whitespace-nowrap">{selection.selectionLabel} {selection.odds > 1 && `@ ${selection.odds.toFixed(2)}`}</b></div>)}</div><div className="mt-4 flex justify-between border-t border-border pt-3 text-sm"><span className="text-muted-foreground">Potential return</span><b className="text-primary">{formatKes(bet.potentialReturn)}</b></div></div>}</article>) : <div className="rounded-xl border border-border p-10 text-center"><ReceiptText className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-muted-foreground">No {active.toLowerCase()} bets yet.</p></div>}</div></main><SiteFooter /></div>
}
