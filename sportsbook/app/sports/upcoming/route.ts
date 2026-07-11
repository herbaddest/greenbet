import { NextResponse } from "next/server";
import { getFixturesByDate } from "@/services/football-api";

export async function GET() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const date = tomorrow.toISOString().split("T")[0];

  try {
    const matches = await getFixturesByDate(date);
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch fixtures" },
      { status: 500 }
    );
  }
}