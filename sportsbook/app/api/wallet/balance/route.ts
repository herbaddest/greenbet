import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * GET /api/wallet/balance
 *
 * Returns the authenticated user's wallet balance.
 * Relies on Supabase Row Level Security — the service-role client
 * is NOT used here; instead we use the anon key and rely on the
 * request's auth cookie so RLS policies apply.
 *
 * Response: { balance, bonus_balance, locked_bonus, total_winnings }
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Create a client that reads the auth cookie from the request context.
    // Next.js route handlers run on the server, so the anon client will
    // pick up the user's session cookie automatically.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Verify the caller is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("sportsbook_wallets")
      .select("balance, bonus_balance, locked_bonus, total_winnings")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { balance: 0, bonus_balance: 0, locked_bonus: 0, total_winnings: 0 },
        { status: 200 }
      )
    }

    return NextResponse.json({
      balance: Number(data.balance),
      bonus_balance: Number(data.bonus_balance),
      locked_bonus: Number(data.locked_bonus),
      total_winnings: Number(data.total_winnings),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}