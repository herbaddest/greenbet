import type { WalletBalance, Transaction } from "@/types"
import { supabase } from "@/lib/supabase"

const emptyWallet: WalletBalance = { main: 0, bonus: 0, locked: 0, totalWinnings: 0, currency: "KES" }

export async function getWallet(userId: string): Promise<WalletBalance> {
  const { data, error } = await supabase.from("sportsbook_wallets").select("balance, bonus_balance, locked_bonus, total_winnings").eq("user_id", userId).maybeSingle()
  if (error || !data) return emptyWallet
  return { main: Number(data.balance ?? 0), bonus: Number(data.bonus_balance ?? 0), locked: Number(data.locked_bonus ?? 0), totalWinnings: Number(data.total_winnings ?? 0), currency: "KES" }
}

// ============================================================
// WALLET OPERATIONS (via API routes)
// These call our own Next.js API routes so the server-side
// RPC functions handle atomicity and validation.
// ============================================================

interface WalletApiResponse {
  success: boolean
  error?: string
  transaction_id?: string
  balance_before?: number
  balance_after?: number
}

/**
 * Deposit funds into the user's wallet.
 * Calls POST /api/wallet/deposit which invokes the deposit_funds RPC.
 */
export async function depositFunds(
  amount: number,
  reference = "",
  description = "Deposit"
): Promise<WalletApiResponse> {
  const res = await fetch("/api/wallet/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, reference, description }),
  })
  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error ?? "Deposit failed" }
  }
  return data
}

/**
 * Withdraw funds from the user's wallet.
 * Calls POST /api/wallet/withdraw which invokes the withdraw_funds RPC.
 */
export async function withdrawFunds(
  amount: number,
  reference = "",
  description = "Withdrawal"
): Promise<WalletApiResponse> {
  const res = await fetch("/api/wallet/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, reference, description }),
  })
  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data.error ?? "Withdrawal failed" }
  }
  return data
}

interface TransactionsResponse {
  transactions: Transaction[]
  hasMore: boolean
}

/**
 * Fetch transaction history for the current user.
 * Calls GET /api/wallet/transactions with optional pagination and type filter.
 */
export async function getTransactions(
  options: { limit?: number; before?: string; type?: string } = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams()
  if (options.limit) params.set("limit", String(options.limit))
  if (options.before) params.set("before", options.before)
  if (options.type) params.set("type", options.type)

  const res = await fetch(`/api/wallet/transactions?${params.toString()}`, {
    cache: "no-store",
  })
  const data = await res.json()
  if (!res.ok) {
    return { transactions: [], hasMore: false }
  }
  return data
}

export function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 2 }).format(amount)
}
