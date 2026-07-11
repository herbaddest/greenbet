"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MatchCard } from "@/components/match-card"
import { SectionHeading } from "@/components/section-heading"
import { getLiveMatches } from "@/services/match.service"
import type { Match } from "@/types"

export function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([]); const [error, setError] = useState("")
  useEffect(() => { let active = true; const load = async () => { try { const data = await getLiveMatches(); if (active) { setMatches(data); setError("") } } catch (e) { if (active) setError(e instanceof Error ? e.message : "Unable to load live matches") } }; void load(); const timer = window.setInterval(load, 60_000); return () => { active = false; window.clearInterval(timer) } }, [])
  return <section id="live" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><SectionHeading eyebrow="In-play" title="Live Matches" action={<Button variant="ghost" size="lg" className="gap-1 text-primary">View all<ArrowRight className="size-4" /></Button>} />{error ? <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">Live fixtures are temporarily unavailable. Configure <code>API_FOOTBALL_KEY</code> to enable the live feed.</p> : matches.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{matches.map((match) => <MatchCard key={match.id} match={match} />)}</div> : <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">No football matches are currently live.</p>}</section>
}
