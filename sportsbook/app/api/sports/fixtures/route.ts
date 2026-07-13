import { NextResponse } from "next/server"
import { getFixturesByDate, getLiveFixtures, getOddsForFixture, getLiveOddsForFixture } from "@/services/football-api"
import { liveMatches } from "@/lib/data"
import type { Match, OddsMarket } from "@/types"

export const dynamic = "force-dynamic"

// Convert old Match type to new Match type with markets
function convertLegacyMatch(match: any): Match {
  return {
    id: match.id,
    sport: "football",
    league: match.league,
    homeTeam: {
      id: match.home,
      name: match.home,
      shortName: match.home.slice(0, 12),
      logoUrl: ""
    },
    awayTeam: {
      id: match.away,
      name: match.away,
      shortName: match.away.slice(0, 12),
      logoUrl: ""
    },
    startTime: new Date().toISOString(),
    status: match.isLive ? "live" : "upcoming",
    minute: match.minute ? parseInt(match.minute) : undefined,
    isPopular: true,
    isDemoData: true, // this match came from the mock fallback, not API-Football
    markets: [
      {
        id: "1",
        name: "Match Winner",
        selections: [
          { id: "1", label: match.home, price: match.odds.home },
          { id: "X", label: "Draw", price: match.odds.draw },
          { id: "2", label: match.away, price: match.odds.away }
        ]
      }
    ]
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  try {
    const status = searchParams.get("status")
    const withOdds = searchParams.get("withOdds") === "true"
    const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10)
    
    let matches = ((status === "live")
      ? await getLiveFixtures()
      : await getFixturesByDate(dateParam)) ?? []

    let isDemoData = false

    // If API returns empty, use mock data as fallback
    if (matches.length === 0) {
      console.log(`[API] No matches returned, using demo data`)
      matches = liveMatches.map(convertLegacyMatch)
      isDemoData = true
    } else {
      console.log(`[API] Retrieved ${matches.length} real matches`)
    }

    const withMarkets = await Promise.all(matches.map(async (match) => {
      if (!withOdds) return { ...match }
      // If markets already exist (from mock data), use them
      if (match.markets && match.markets.length > 0) {
        return { ...match }
      }
      // Otherwise fetch from API — live matches need the live-odds endpoint,
      // since pre-match odds books typically close once a match kicks off
      const markets = match.status === "live"
        ? await getLiveOddsForFixture(match.id)
        : await getOddsForFixture(match.id)
      return { ...match, markets }
    }))

    return NextResponse.json({ matches: withMarkets, isDemoData })
  } catch (error) {
    console.error("[API] Error fetching fixtures:", error)
    // On error, return mock data
    const mockMatches = liveMatches.map(convertLegacyMatch)
    return NextResponse.json({ matches: mockMatches, isDemoData: true })
  }
}