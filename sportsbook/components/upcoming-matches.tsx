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
  return <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><SectionHeading eyebrow="Next to kick off" title="Upcoming Matches" />{Object.keys(leagues).length ? <div className="space-y-7">{Object.entries(leagues).map(([league, fixtures]) => <div key={league}><h3 className="mb-3 text-sm font-bold text-muted-foreground">{league}</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{fixtures.map((match) => <MatchCard key={match.id} match={match} />)}</div></div>)}</div> : <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">Upcoming fixtures will appear here when the sports feed is connected.</p>}</section>
}
