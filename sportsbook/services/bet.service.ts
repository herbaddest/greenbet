import type { PlacedBet } from "@/types"
import { supabase } from "@/lib/supabase"

// ============================================================
// BET SERVICE
// placeBet() calls the server-side API route which invokes the
// place_bet RPC for atomic wallet deduction + bet creation.
// getBetHistory() reads directly from Supabase (RLS-protected).
// ============================================================

interface PlaceBetResponse {
  success: boolean
  error?: string
  bet_id?: string
  transaction_id?: string
  balance_before?: number
  balance_after?: number
}

/**
 * Place a bet atomically — deducts wallet + saves bet + records transaction.
 * Calls POST /api/bets/place which invokes the place_bet RPC.
 */
export async function placeBet(params: {
  betId: string
  stake: number
  totalOdds: number
  potentialReturn: number
  selections: Array<{ id: string; matchId?: string; matchLabel: string; selectionLabel: string; odds: number; isLive?: boolean }>
}): Promise<PlaceBetResponse> {
  const res = await fetch("/api/bets/place", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error ?? "Bet placement failed" }
  }
  return data
}

export async function getBetHistory(userId: string): Promise<PlacedBet[]> {
  const { data, error } = await supabase.from("sportsbook_bets").select("*").eq("user_id", userId).order("created_at", { ascending: false })
  if (error || !data) return []
  return data.map((bet) => ({
    id: bet.id,
    placedAt: bet.created_at,
    mode: bet.mode ?? "multiple",
    stake: Number(bet.stake),
    totalOdds: Number(bet.total_odds),
    potentialReturn: Number(bet.potential_return),
    selections: Array.isArray(bet.selections) ? bet.selections.map((s: Record<string, unknown>) => ({
      id: String(s.id ?? ""),
      matchId: String(s.matchId ?? ""),
      matchLabel: String(s.matchLabel ?? ""),
      marketName: String(s.marketName ?? ""),
      selectionLabel: String(s.selectionLabel ?? ""),
      odds: Number(s.odds ?? 1),
      isLive: Boolean(s.isLive ?? false),
    })) : [],
    status: bet.status ?? "open",
  }))
}
