import { NextResponse } from "next/server";
import { getLiveFixtures } from "@/services/football-api";

export async function GET() {
  try {
    const matches = await getLiveFixtures();
    return NextResponse.json(matches);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch live matches" },
      { status: 500 }
    );
  }
}