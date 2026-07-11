"use client"

import { Clock } from "lucide-react"
import type { Match, OddsMarketSelection } from "@/types"
import { useBetSlip } from "@/contexts/BetSlipContext"
import { cn } from "@/lib/utils"

export function MatchCard({ match }: { match: Match }) {
  const { addSelection, isSelected } = useBetSlip()
  const market = match.markets.find((item) => /match winner|match result/i.test(item.name)) ?? match.markets[0]
  const odds = market?.selections.slice(0, 3) ?? []
  function select(selection: OddsMarketSelection) {
    addSelection({ id: `${match.id}-${market.id}-${selection.id}`, matchId: match.id, matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`, marketName: market.name, selectionLabel: selection.label, odds: selection.price, isLive: match.status === "live" })
  }
  return <article className="glass flex flex-col rounded-2xl p-4 transition-colors hover:border-primary/30"><div className="flex items-center justify-between text-xs"><span className="truncate font-medium text-muted-foreground">{match.league}</span>{match.status === "live" ? <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" />LIVE {match.minute}&apos;</span> : <span className="flex shrink-0 items-center gap-1 text-muted-foreground"><Clock className="size-3" />{new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}</div><div className="my-4 space-y-2 text-sm"><div className="flex justify-between gap-2 font-semibold"><span className="truncate">{match.homeTeam.name}</span>{match.status === "live" && <span>{match.homeScore ?? 0}</span>}</div><div className="flex justify-between gap-2 font-semibold"><span className="truncate">{match.awayTeam.name}</span>{match.status === "live" && <span>{match.awayScore ?? 0}</span>}</div></div><div className="grid grid-cols-3 gap-2">{odds.length ? odds.map((selection) => { const id = `${match.id}-${market.id}-${selection.id}`; return <button key={id} onClick={() => select(selection)} className={cn("flex flex-col items-center rounded-lg border py-2 transition-all", isSelected(id) ? "border-primary bg-primary/15" : "border-border bg-secondary/60 hover:border-primary/50 hover:bg-primary/10")}><span className="text-[0.65rem] font-medium uppercase text-muted-foreground">{selection.label}</span><span className="text-sm font-bold text-primary">{selection.price.toFixed(2)}</span></button> }) : <p className="col-span-3 rounded-lg bg-secondary/40 py-2 text-center text-xs text-muted-foreground">Odds unavailable</p>}</div></article>
}
