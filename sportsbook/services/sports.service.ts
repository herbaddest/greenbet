import type { Match, OddsMarket } from "@/types"

// ============================================================
// SPORTS SERVICE (client-safe)
// Calls our own /api/sports/* route handlers — never api-sports.io
// directly, so no API key ever reaches the browser. Function names
// match the spec: getLiveMatches(), getUpcomingMatches(),
// getPopularLeagues(), getMatchDetails().
// ============================================================

interface FixturesApiResponse {
  matches: Match[]
  error?: string
}

async function fetchFixtures(params: Record<string, string>): Promise<Match[]> {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`/api/sports/fixtures?${query}`, {
    // Live views poll this on an interval themselves; this fetch
    // should always hit the network, not a stale client cache.
    cache: "no-store",
  })
  const data: FixturesApiResponse = await res.json()

  if (data.error) {
    // Surface a clear error rather than silently returning an empty list —
    // callers can decide how to render it (toast, banner, etc.)
    throw new Error(data.error)
  }

  return data.matches
}

export async function getLiveMatches(): Promise<Match[]> {
  return fetchFixtures({ status: "live" })
}

export async function getUpcomingMatches(dateISO?: string): Promise<Match[]> {
  const date = dateISO ?? new Date().toISOString().split("T")[0]
  return fetchFixtures({ status: "upcoming", date })
}

export async function getPopularMatches(): Promise<Match[]> {
  const [live, upcoming] = await Promise.all([
    fetchFixtures({ status: "live" }),
    fetchFixtures({ status: "upcoming" }),
  ])
  return [...live, ...upcoming].filter((m) => m.isPopular)
}

// Leagues aren't a separate API-Football call in our current route —
// derive the distinct list from whatever fixtures we already have,
// which avoids spending an extra request purely to list league names.
export async function getPopularLeagues(): Promise<
  { name: string; logoUrl?: string; matchCount: number }[]
> {
  const matches = await getPopularMatches()
  const byLeague = new Map<string, { logoUrl?: string; count: number }>()

  for (const match of matches) {
    const existing = byLeague.get(match.league)
    byLeague.set(match.league, {
      logoUrl: match.leagueLogoUrl,
      count: (existing?.count ?? 0) + 1,
    })
  }

  return Array.from(byLeague.entries()).map(([name, info]) => ({
    name,
    logoUrl: info.logoUrl,
    matchCount: info.count,
  }))
}

export async function getMatchDetails(
  matchId: string
): Promise<(Match & { markets: OddsMarket[] }) | null> {
  // withOdds=true is safe here — this is a single-fixture lookup, not a
  // list view, so it costs exactly one extra API-Football call.
  const live = await fetchFixtures({ status: "live", withOdds: "true" })
  const found =
    live.find((m) => m.id === matchId) ??
    (await fetchFixtures({ status: "upcoming", withOdds: "true" })).find(
      (m) => m.id === matchId
    )

  return found ? { ...found, markets: found.markets } : null
}
