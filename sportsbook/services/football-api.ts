import "server-only"
import type { Match, MatchStatus, OddsMarket, SportKey, Team } from "@/types"

// ============================================================
// API-FOOTBALL WRAPPER (server-only)
// Talks to api-sports.io's v3 football API. This file must never
// be imported into a client component — it reads API_FOOTBALL_KEY
// from process.env, which should stay server-side only. All access
// from the browser goes through the Next.js route handlers in
// app/api/sports/*, which import this file safely.
//
// Setup required before this works:
//   1. Sign up at https://www.api-football.com (or via RapidAPI)
//   2. Add API_FOOTBALL_KEY=your_key_here to .env.local
//   3. Free tier: ~100 requests/day. Poll conservatively (30-60s
//      intervals for live fixtures), don't hammer this on every render.
// ============================================================

const API_BASE = "https://v3.football.api-sports.io"

// A sensible default league set for the "Popular" rail — Premier League,
// La Liga, Bundesliga, Serie A, Ligue 1, Champions League, Europa League.
// Free-tier season coverage is limited, so not every league/season
// combination will return data — see api-football.com docs for current
// season availability on your plan.
export const DEFAULT_LEAGUE_IDS = [39, 140, 78, 135, 61, 2, 3]

interface ApiFootballFixtureResponse {
  response: ApiFootballFixture[]
}

interface ApiFootballFixture {
  fixture: {
    id: number
    date: string
    status: { short: string; elapsed: number | null }
  }
  league: { id: number; name: string; logo: string; country: string }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
}

interface ApiFootballOddsResponse {
  response: {
    fixture: { id: number }
    bookmakers: {
      name: string
      bets: {
        id: number
        name: string
        values: { value: string; odd: string }[]
      }[]
    }[]
  }[]
}

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) {
    throw new Error(
      "API_FOOTBALL_KEY is not set. Add it to .env.local — see lib/football-api.ts for setup instructions."
    )
  }
  return key
}

async function apiFootballFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": getApiKey() },
    // Live data shouldn't be cached; upcoming fixtures can tolerate a short cache.
    next: { revalidate: path.includes("live") ? 0 : 60 },
  })

  if (!res.ok) {
    throw new Error(`API-Football request failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

function mapStatus(short: string): MatchStatus {
  if (["1H", "2H", "HT", "ET", "P", "LIVE", "BT"].includes(short)) return "live"
  if (["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"].includes(short)) return "finished"
  return "upcoming"
}

function mapTeam(team: { id: number; name: string; logo: string }): Team {
  return {
    id: String(team.id),
    name: team.name,
    shortName: team.name.length > 12 ? team.name.slice(0, 12) : team.name,
    logoUrl: team.logo,
  }
}

function mapFixtureToMatch(fixture: ApiFootballFixture): Match {
  const status = mapStatus(fixture.fixture.status.short)
  return {
    id: String(fixture.fixture.id),
    sport: "football" as SportKey,
    league: fixture.league.name,
    leagueLogoUrl: fixture.league.logo,
    homeTeam: mapTeam(fixture.teams.home),
    awayTeam: mapTeam(fixture.teams.away),
    startTime: fixture.fixture.date,
    status,
    minute: fixture.fixture.status.elapsed ?? undefined,
    homeScore: fixture.goals.home ?? undefined,
    awayScore: fixture.goals.away ?? undefined,
    isPopular: DEFAULT_LEAGUE_IDS.includes(fixture.league.id),
    markets: [], // populated separately via getOddsForFixture when needed
  }
}

// Maps API-Football's bookmaker/bet structure down to a single
// consolidated market per bet type, averaging across bookmakers isn't
// done here — we just take the first bookmaker's odds for simplicity.
// A production build would let the user pick a bookmaker or show best odds.
function mapOddsToMarkets(
  bookmakers: ApiFootballOddsResponse["response"][number]["bookmakers"]
): OddsMarket[] {
  const primary = bookmakers[0]
  if (!primary) return []

  return primary.bets.map((bet) => ({
    id: String(bet.id),
    name: bet.name,
    selections: bet.values.map((v, i) => ({
      id: `${bet.id}-${i}`,
      label: v.value,
      price: parseFloat(v.odd),
    })),
  }))
}

export async function getLiveFixtures(): Promise<Match[]> {
  const data = await apiFootballFetch<ApiFootballFixtureResponse>("/fixtures", {
    live: "all",
  })
  return data.response.map(mapFixtureToMatch)
}

export async function getFixturesByDate(dateISO: string): Promise<Match[]> {
  const data = await apiFootballFetch<ApiFootballFixtureResponse>("/fixtures", {
    date: dateISO,
  })
  return data.response.map(mapFixtureToMatch)
}

export async function getFixturesByLeague(
  leagueId: number,
  season: number
): Promise<Match[]> {
  const data = await apiFootballFetch<ApiFootballFixtureResponse>("/fixtures", {
    league: String(leagueId),
    season: String(season),
  })
  return data.response.map(mapFixtureToMatch)
}

export async function getOddsForFixture(fixtureId: string): Promise<OddsMarket[]> {
  const data = await apiFootballFetch<ApiFootballOddsResponse>("/odds", {
    fixture: fixtureId,
  })
  const entry = data.response[0]
  if (!entry) return []
  return mapOddsToMarkets(entry.bookmakers)
}

interface ApiFootballLiveOddsResponse {
  response: {
    fixture: { id: number; status: { stopped: boolean; blocked: boolean; finished: boolean } }
    odds: {
      id: number
      name: string
      values: { value: string; odd: string; main?: boolean; suspended: boolean }[]
    }[]
  }[]
}

// Pre-match odds (getOddsForFixture, above) typically stop being offered once
// a match kicks off. Live/in-play odds are a SEPARATE API-Football endpoint
// with a different response shape (no bookmakers array, no season param) —
// this is required for matches with status "live", not an optional extra.
export async function getLiveOddsForFixture(fixtureId: string): Promise<OddsMarket[]> {
  const data = await apiFootballFetch<ApiFootballLiveOddsResponse>("/odds/live", {
    fixture: fixtureId,
  })
  const entry = data.response[0]
  if (!entry) return []

  return entry.odds.map((market) => ({
    id: String(market.id),
    name: market.name,
    selections: market.values
      .filter((v) => !v.suspended)
      .map((v, i) => ({
        id: `${market.id}-${i}`,
        label: v.value,
        price: parseFloat(v.odd),
      })),
  }))
}