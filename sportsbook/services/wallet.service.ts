import type { WalletBalance } from "@/types"
import { supabase } from "@/lib/supabase"

const emptyWallet: WalletBalance = { main: 0, bonus: 0, locked: 0, totalWinnings: 0, currency: "KES" }

export async function getWallet(userId: string): Promise<WalletBalance> {
  const { data, error } = await supabase.from("sportsbook_wallets").select("balance, bonus_balance, locked_bonus, total_winnings").eq("user_id", userId).maybeSingle()
  if (error || !data) return emptyWallet
  return { main: Number(data.balance ?? 0), bonus: Number(data.bonus_balance ?? 0), locked: Number(data.locked_bonus ?? 0), totalWinnings: Number(data.total_winnings ?? 0), currency: "KES" }
}

export function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 2 }).format(amount)
}
