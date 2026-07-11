import type { PlacedBet } from "@/types"
import { supabase } from "@/lib/supabase"

export async function createBet(userId: string, bet: PlacedBet): Promise<PlacedBet> {
  const { error } = await supabase.from("sportsbook_bets").insert({
    id: bet.id, user_id: userId, stake: bet.stake, total_odds: bet.totalOdds,
    potential_return: bet.potentialReturn, status: bet.status, selections: bet.selections,
  })
  if (error) throw error
  return bet
}

export async function getBetHistory(userId: string): Promise<PlacedBet[]> {
  const { data, error } = await supabase.from("sportsbook_bets").select("*").eq("user_id", userId).order("created_at", { ascending: false })
  if (error || !data) return []
  return data.map((bet) => ({ id: bet.id, placedAt: bet.created_at, mode: "multiple", stake: Number(bet.stake), totalOdds: Number(bet.total_odds), potentialReturn: Number(bet.potential_return), selections: bet.selections ?? [], status: bet.status }))
}
