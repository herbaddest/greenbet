import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * POST /api/bets/place
 *
 * Atomically places a bet: deducts wallet balance + saves bet + records transaction.
 * Uses the `place_bet` RPC which locks the wallet row with SELECT FOR UPDATE.
 *
 * Body: {
 *   betId: string        // unique client-generated ID (prevents duplicates)
 *   stake: number
 *   totalOdds: number
 *   potentialReturn: number
 *   selections: Array<{ id: string; matchLabel: string; selectionLabel: string; odds: number }>
 * }
 *
 * Response: { success, bet_id, transaction_id, balance_before, balance_after }
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { betId, stake, totalOdds, potentialReturn, selections } = body

    // Validate required fields
    if (!betId || typeof betId !== "string") {
      return NextResponse.json({ error: "betId is required" }, { status: 400 })
    }
    if (!Number.isFinite(stake) || stake <= 0) {
      return NextResponse.json({ error: "Stake must be a positive number" }, { status: 400 })
    }
    if (!Number.isFinite(totalOdds) || totalOdds <= 0) {
      return NextResponse.json({ error: "Total odds must be a positive number" }, { status: 400 })
    }
    if (!Number.isFinite(potentialReturn) || potentialReturn < 0) {
      return NextResponse.json({ error: "Potential return must be a non-negative number" }, { status: 400 })
    }
    if (!Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json({ error: "At least one selection is required" }, { status: 400 })
    }

    // Validate minimum stake
    if (stake < 10) {
      return NextResponse.json({ error: "Minimum stake is KSh 10" }, { status: 400 }
      )
    }

    // Call the atomic place_bet RPC
    const { data, error } = await supabase.rpc("place_bet", {
      p_bet_id: betId,
      p_user_id: user.id,
      p_stake: stake,
      p_total_odds: totalOdds,
      p_potential_return: potentialReturn,
      p_selections: JSON.parse(JSON.stringify(selections)),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = data as {
      success: boolean
      error?: string
      bet_id?: string
      transaction_id?: string
      balance_before?: number
      balance_after?: number
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Bet placement failed" }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}