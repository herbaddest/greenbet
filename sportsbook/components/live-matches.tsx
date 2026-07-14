"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MatchCard } from "@/components/match-card"
import { SectionHeading } from "@/components/section-heading"
import { getLiveMatches, getUpcomingMatches } from "@/services/match.service"
import type { Match } from "@/types"

export function LiveMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState("")
  const isDemoData = matches.length > 0 && matches.every((m) => m.isDemoData)
  
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        // Try to get live matches first
        let data = await getLiveMatches()
        
        // If no live matches, fall back to upcoming matches
        if (data.length === 0) {
          data = await getUpcomingMatches()
        }
        
        if (active) {
          setMatches(data)
          setError("")
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load matches")
      }
    }
    
    void load()
    const timer = window.setInterval(load, 60_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])
  
  return (
    <section id="live" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading eyebrow="In-play" title="Live Matches" action={<Link href="/live" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "gap-1 text-primary")}>View all<ArrowRight className="size-4" /></Link>} />
      {isDemoData && (
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
          Demo Data — live feed unavailable right now
        </span>
      )}
      {error ? (
        <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">Fixtures are temporarily unavailable. Configure <code>API_FOOTBALL_KEY</code> to enable the feed.</p>
      ) : matches.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">No matches available at the moment.</p>
      )}
    </section>
  )
}