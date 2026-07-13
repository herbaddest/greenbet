import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * POST /api/wallet/deposit
 *
 * Deposits funds into the authenticated user's wallet.
 * Uses the `deposit_funds` RPC for atomic balance update + transaction recording.
 *
 * Body: { amount: number, reference?: string, description?: string }
 *
 * Response: { success, transaction_id, balance_before, balance_after }
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
    const amount = Number(body.amount)
    const reference = String(body.reference ?? "")
    const description = String(body.description ?? "Deposit")

    // Client-side validation
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      )
    }

    if (amount > 1_000_000) {
      return NextResponse.json(
        { error: "Deposit amount exceeds maximum of KSh 1,000,000" },
        { status: 400 }
      )
    }

    // Call the atomic deposit RPC
    const { data, error } = await supabase.rpc("deposit_funds", {
      p_user_id: user.id,
      p_amount: amount,
      p_reference: reference,
      p_description: description,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = data as {
      success: boolean
      error?: string
      transaction_id?: string
      balance_before?: number
      balance_after?: number
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Deposit failed" }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}