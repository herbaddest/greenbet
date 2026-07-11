"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDownCircle, ArrowUpCircle, Gift, LockKeyhole, Trophy, Wallet } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AccountModal } from "@/components/account-modal"
import { useAuth } from "@/contexts/AuthContext"
import { formatKes, getWallet } from "@/services/wallet.service"
import type { WalletBalance } from "@/types"

export default function WalletPage() {
  const { user, isLoading } = useAuth(); const router = useRouter(); const params = useSearchParams()
  const [wallet, setWallet] = useState<WalletBalance | null>(null); const [modal, setModal] = useState<"deposit" | "withdraw" | null>(params.get("intent") === "withdraw" ? "withdraw" : params.get("intent") === "deposit" ? "deposit" : null)
  useEffect(() => { if (!isLoading && !user) router.replace("/login?next=/wallet"); if (user) void getWallet(user.id).then(setWallet) }, [isLoading, router, user])
  const cards = wallet ? [{ label: "Bonus Balance", value: wallet.bonus, icon: Gift }, { label: "Locked Bonus", value: wallet.locked, icon: LockKeyhole }, { label: "Total Winnings", value: wallet.totalWinnings, icon: Trophy }] : []
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="font-display text-3xl font-bold">Wallet</h1><div className="mt-7 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 p-6 text-primary-foreground sm:p-8"><div className="flex items-center gap-4"><Wallet className="size-10" /><div><p className="opacity-80">Available Balance</p><h2 className="mt-1 text-4xl font-bold sm:text-5xl">{formatKes(wallet?.main ?? 0)}</h2></div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="glass rounded-xl p-4"><Icon className="size-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{formatKes(value)}</p></div>)}</div><div className="mt-6 grid gap-4 sm:grid-cols-2"><button onClick={() => setModal("deposit")} className="glass rounded-xl p-5 text-left hover:border-primary/50"><ArrowDownCircle className="size-8 text-primary" /><h2 className="mt-3 font-bold">Deposit</h2><p className="mt-1 text-sm text-muted-foreground">Fund your account securely with M-Pesa.</p></button><button onClick={() => setModal("withdraw")} className="glass rounded-xl p-5 text-left hover:border-primary/50"><ArrowUpCircle className="size-8 text-primary" /><h2 className="mt-3 font-bold">Withdraw</h2><p className="mt-1 text-sm text-muted-foreground">Send available funds to your M-Pesa number.</p></button></div></main><SiteFooter />{modal && <AccountModal type={modal} onClose={() => { setModal(null); router.replace("/wallet") }} />}</div>
}
