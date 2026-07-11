"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { createBet } from "@/services/bet.service"
import { getWallet } from "@/services/wallet.service"
import { vetaTickets } from "@/lib/data"
import type { BetSlipSelection } from "@/types"

const fixtures = ["AFC Leopards vs Gor Mahia", "Arsenal vs Chelsea", "Real Madrid vs Sevilla", "Inter vs Juventus", "Bayern Munich vs Dortmund", "PSG vs Marseille", "Liverpool vs Tottenham", "Barcelona vs Atletico Madrid", "Napoli vs AC Milan", "Ajax vs PSV", "Benfica vs Porto", "Celtic vs Rangers", "Galatasaray vs Fenerbahce", "Sporting CP vs Braga", "Roma vs Lazio", "Lyon vs Monaco", "Club Brugge vs Genk"]
const picks = ["1", "X", "2"]

export default function VetaPage() {
  const { user } = useAuth(); const router = useRouter(); const params = useSearchParams(); const ticket = vetaTickets.find((item) => item.id === params.get("ticket")) ?? vetaTickets[0]
  const games = fixtures.slice(0, ticket.matches); const [selections, setSelections] = useState<Record<number, string>>({}); const [stake, setStake] = useState(20); const [message, setMessage] = useState("")
  const completed = Object.keys(selections).length === games.length
  const picksForBet = useMemo<BetSlipSelection[]>(() => games.map((match, index) => ({ id: `veta-${ticket.id}-${index}-${selections[index]}`, matchId: `veta-${ticket.id}-${index}`, matchLabel: match, marketName: "Veta Jackpot", selectionLabel: selections[index], odds: 1, isLive: false })), [games, selections, ticket.id])
  async function submit() {
    if (!user) return router.push(`/register?next=${encodeURIComponent(`/veta?ticket=${ticket.id}`)}`)
    if (!completed) return setMessage("Pick 1, X, or 2 for every match.")
    if (stake < 20) return setMessage("Minimum Veta stake is KSh 20.")
    const wallet = await getWallet(user.id); if (wallet.main < stake) return router.push(`/wallet?intent=deposit&next=${encodeURIComponent(`/veta?ticket=${ticket.id}`)}`)
    try { await createBet(user.id, { id: `veta_${Date.now()}`, placedAt: new Date().toISOString(), mode: "multiple", stake, totalOdds: 1, potentialReturn: 0, selections: picksForBet, status: "open" }); setMessage("Your Veta ticket has been submitted. Good luck!") } catch { setMessage("Your ticket could not be saved. Please try again.") }
  }
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Veta Jackpot</p><h1 className="mt-1 font-display text-3xl font-bold">{ticket.title}</h1><p className="mt-2 text-sm text-muted-foreground">Select a result for all {ticket.matches} fixtures to enter the {ticket.jackpot} jackpot.</p></div><span className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-bold text-primary">Closes in {ticket.closesIn}</span></div><div className="mt-7 overflow-hidden rounded-2xl border border-border"><div className="grid grid-cols-[2rem_1fr_11rem] gap-3 bg-secondary/60 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground"><span>#</span><span>Fixture</span><span className="text-center">Pick</span></div>{games.map((game, index) => <div key={game} className="grid grid-cols-[2rem_1fr_11rem] items-center gap-3 border-t border-border px-4 py-3"><span className="text-sm text-muted-foreground">{index + 1}</span><p className="text-sm font-semibold">{game}</p><div className="grid grid-cols-3 gap-1.5">{picks.map((pick) => <button key={pick} onClick={() => setSelections((current) => ({ ...current, [index]: pick }))} className={`rounded-lg py-2 text-sm font-bold transition ${selections[index] === pick ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-primary/15"}`}>{pick}</button>)}</div></div>)}</div><div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium">Stake (KSh)<input min="20" type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 outline-none focus:border-primary" /></label><Button onClick={submit} className="h-11 font-bold">Submit Veta Ticket</Button></div>{message && <p className="mt-3 text-sm text-primary">{message}</p>}</main><SiteFooter /></div>
}
