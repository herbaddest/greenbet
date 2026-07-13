"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDownCircle, ArrowUpCircle, Gift, LockKeyhole, Trophy, Wallet, ArrowLeftRight, ChevronDown } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountModal } from "@/components/account-modal"
import { useAuth } from "@/contexts/AuthContext"
import { formatKes, getWallet, getTransactions } from "@/services/wallet.service"
import type { WalletBalance, Transaction } from "@/types"

export default function WalletPage() {
  const { user, isLoading } = useAuth(); const router = useRouter(); const params = useSearchParams()
  const [wallet, setWallet] = useState<WalletBalance | null>(null); const [modal, setModal] = useState<"deposit" | "withdraw" | null>(params.get("intent") === "withdraw" ? "withdraw" : params.get("intent") === "deposit" ? "deposit" : null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [expandedTx, setExpandedTx] = useState<string | null>(null)

  useEffect(() => { if (!isLoading && !user) router.replace("/login?next=/wallet"); if (user) { void getWallet(user.id).then(setWallet); void loadTransactions() } }, [isLoading, router, user])

  async function loadTransactions() {
    setTxLoading(true)
    try {
      const result = await getTransactions({ limit: 20 })
      setTransactions(result.transactions)
    } catch { /* silently fail — transactions are supplementary */ }
    setTxLoading(false)
  }

  const cards = wallet ? [{ label: "Bonus Balance", value: wallet.bonus, icon: Gift }, { label: "Locked Bonus", value: wallet.locked, icon: LockKeyhole }, { label: "Total Winnings", value: wallet.totalWinnings, icon: Trophy }] : []

  const typeIcon = (type: string) => {
    switch (type) {
      case "deposit": return <ArrowDownCircle className="size-4 text-emerald-500" />
      case "withdrawal": return <ArrowUpCircle className="size-4 text-red-500" />
      case "bet_placed": return <Wallet className="size-4 text-amber-500" />
      case "bet_won": return <Trophy className="size-4 text-emerald-500" />
      default: return <ArrowLeftRight className="size-4 text-muted-foreground" />
    }
  }

  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="font-display text-3xl font-bold">Wallet</h1><div className="mt-7 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 p-6 text-primary-foreground sm:p-8"><div className="flex items-center gap-4"><Wallet className="size-10" /><div><p className="opacity-80">Available Balance</p><h2 className="mt-1 text-4xl font-bold sm:text-5xl">{formatKes(wallet?.main ?? 0)}</h2></div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="glass rounded-xl p-4"><Icon className="size-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{formatKes(value)}</p></div>)}</div><div className="mt-6 grid gap-4 sm:grid-cols-2"><button onClick={() => setModal("deposit")} className="glass rounded-xl p-5 text-left hover:border-primary/50"><ArrowDownCircle className="size-8 text-primary" /><h2 className="mt-3 font-bold">Deposit</h2><p className="mt-1 text-sm text-muted-foreground">Fund your account securely with M-Pesa.</p></button><button disabled className="glass rounded-xl p-5 text-left opacity-50 cursor-not-allowed"><ArrowUpCircle className="size-8 text-muted-foreground" /><h2 className="mt-3 font-bold text-muted-foreground">Withdraw</h2><p className="mt-1 text-sm text-muted-foreground">Withdrawals are currently unavailable.</p></button></div>

      {/* Transaction History */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Transaction History</h2>
        {txLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border p-8 text-center">
            <ArrowLeftRight className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="glass overflow-hidden rounded-xl">
                <button
                  onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    {typeIcon(tx.type)}
                    <div>
                      <p className="text-sm font-semibold capitalize">{tx.type.replace(/_/g, " ")}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString("en-KE")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type === "deposit" || tx.type === "bet_won" ? "text-emerald-500" : tx.type === "withdrawal" || tx.type === "bet_placed" ? "text-red-500" : ""}`}>
                        {tx.type === "deposit" || tx.type === "bet_won" ? "+" : "-"}{formatKes(tx.amount)}
                      </p>
                      <p className={`text-xs capitalize ${tx.status === "completed" ? "text-emerald-500" : tx.status === "failed" ? "text-red-500" : "text-muted-foreground"}`}>{tx.status}</p>
                    </div>
                    <ChevronDown className={`size-4 transition-transform ${expandedTx === tx.id ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {expandedTx === tx.id && (
                  <div className="border-t border-border bg-secondary/20 p-4 text-sm">
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">{tx.reference || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span>{tx.description || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Balance before</span><span>{formatKes(tx.balanceBefore)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Balance after</span><span>{formatKes(tx.balanceAfter)}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </main><SiteFooter />{modal && <AccountModal type={modal} onClose={() => { setModal(null); router.replace("/wallet"); void getWallet(user!.id).then(setWallet); void loadTransactions() }} />}</div>
}
