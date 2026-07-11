import { NextResponse } from "next/server"
import { getFixturesByDate, getLiveFixtures, getOddsForFixture } from "@/services/football-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  try {
    const status = searchParams.get("status")
    const withOdds = searchParams.get("withOdds") === "true"
    const matches = status === "live"
      ? await getLiveFixtures()
      : await getFixturesByDate(searchParams.get("date") ?? new Date().toISOString().slice(0, 10))
    const withMarkets = await Promise.all(matches.map(async (match) => ({
      ...match,
      markets: withOdds ? await getOddsForFixture(match.id) : match.markets,
    })))
    return NextResponse.json({ matches: withMarkets })
  } catch (error) {
    return NextResponse.json({ matches: [], error: error instanceof Error ? error.message : "Unable to load fixtures" }, { status: 503 })
  }
}
