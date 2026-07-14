import { NextResponse } from "next/server"
import { getFixturesByDate, getLiveFixtures, getOddsForFixture, getLiveOddsForFixture } from "@/services/football-api"
import type { Match, OddsMarket } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const status = searchParams.get("status");
    const withOdds = searchParams.get("withOdds") === "true";

    let matches: Match[] = [];

    if (status === "live") {
      matches = await getLiveFixtures();
    } else {
      // Search up to 7 days ahead
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const fixtures = await getFixturesByDate(
          date.toISOString().split("T")[0]
        );

        if (fixtures.length > 0) {
          matches = fixtures;
          break;
        }
      }
    }

    console.log(`[API] Retrieved ${matches.length} real matches`);

    const withMarkets = await Promise.all(
      matches.map(async (match) => {
        if (!withOdds) return match;

        if (match.markets?.length) return match;

        const markets =
          match.status === "live"
            ? await getLiveOddsForFixture(match.id)
            : await getOddsForFixture(match.id);

        return {
          ...match,
          markets,
        };
      })
    );

    return NextResponse.json({
      matches: withMarkets,
      isDemoData: false,
    });
  } catch (error) {
    console.error("[API] Error fetching fixtures:", error);

    return NextResponse.json(
      {
        matches: [],
        isDemoData: false,
        error: "Unable to fetch fixtures",
      },
      { status: 500 }
    );
  }
}