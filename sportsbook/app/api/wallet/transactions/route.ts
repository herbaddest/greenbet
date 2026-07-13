import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * GET /api/wallet/transactions
 *
 * Returns the authenticated user's transaction history.
 * Paginated with cursor-based pagination using `created_at`.
 *
 * Query params:
 *   - limit (number, default 20, max 100)
 *   - before (ISO timestamp, cursor for older records)
 *   - type (optional filter: deposit | withdrawal | bet_placed | bet_won | ...)
 *
 * Response: { transactions: [...], hasMore: boolean }
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100)
    const before = searchParams.get("before")
    const typeFilter = searchParams.get("type")

    let query = supabase
      .from("sportsbook_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt("created_at", before)
    }

    if (typeFilter) {
      query = query.eq("type", typeFilter)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const transactions = (data ?? []).map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      balanceBefore: Number(tx.balance_before),
      balanceAfter: Number(tx.balance_after),
      status: tx.status,
      reference: tx.reference,
      description: tx.description,
      createdAt: tx.created_at,
    }))

    const hasMore = (count ?? 0) > limit

    return NextResponse.json({ transactions, hasMore })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}