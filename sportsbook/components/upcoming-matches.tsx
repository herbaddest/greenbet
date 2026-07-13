"use client"

import { useEffect, useMemo, useState } from "react"
import { MatchCard } from "@/components/match-card"
import { SectionHeading } from "@/components/section-heading"
import { getUpcomingMatches } from "@/services/match.service"
import type { Match } from "@/types"

export function UpcomingMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  useEffect(() => { void getUpcomingMatches().then(setMatches).catch(() => setMatches([])) }, [])
  const leagues = useMemo(() => matches.reduce<Record<string, Match[]>>((groups, match) => ({ ...groups, [match.league]: [...(groups[match.league] ?? []), match] }), {}), [matches])
  const isDemoData = matches.length > 0 && matches.every((m) => m.isDemoData)
  return <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><SectionHeading eyebrow="Next to kick off" title="Upcoming Matches" />{isDemoData && <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Demo Data — live feed unavailable right now</span>}{Object.keys(leagues).length ? <div className="space-y-7">{Object.entries(leagues).map(([league, fixtures]) => <div key={league}><h3 className="mb-3 text-sm font-bold text-muted-foreground">{league}</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{fixtures.map((match) => <MatchCard key={match.id} match={match} />)}</div></div>)}</div> : <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">Upcoming fixtures will appear here when the sports feed is connected.</p>}</section>
}