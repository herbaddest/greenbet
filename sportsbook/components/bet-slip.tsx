"use client"

import { Trash2, X, Loader2, Wallet } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useBetSlip } from "@/contexts/BetSlipContext"
import { formatKes, getWallet } from "@/services/wallet.service"

export function BetSlip({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { selections, selectionCount, combinedOdds, multiStake, setMultiStake, removeSelection, clearSlip, placeBet, potentialReturn } = useBetSlip()
  const { user, isAuthenticated } = useAuth()
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [isBalanceError, setIsBalanceError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    if (!isAuthenticated || !user) return router.push("/register?next=/")
    if (!selections.length || multiStake <= 0) {
      setMessageType("error")
      return setMessage("Add selections and enter a stake to continue.")
    }

    setLoading(true)
    setMessage("")
    setIsBalanceError(false)

    try {
      // Check wallet balance before attempting to place bet
      const wallet = await getWallet(user.id)
      if (wallet.main < multiStake) {
        setMessageType("error")
        setIsBalanceError(true)
        setMessage(`Insufficient balance. You need ${formatKes(multiStake)} but only have ${formatKes(wallet.main)}.`)
        setLoading(false)
        return
      }

      const result = await placeBet()

      if (!result) {
        setMessageType("error")
        setMessage("Add selections and enter a stake to continue.")
        setLoading(false)
        return
      }

      if (!result.success) {
        if (result.error?.includes("Insufficient balance")) {
          setMessageType("error")
          setIsBalanceError(true)
          setMessage("Insufficient balance. Please deposit funds.")
          setLoading(false)
          return
        }
        if (result.error?.includes("duplicate")) {
          setMessageType("error")
          setMessage("This bet was already submitted.")
          setLoading(false)
          return
        }
        setMessageType("error")
        setMessage(result.error ?? "Bet placement failed. Please try again.")
        setLoading(false)
        return
      }

      setMessageType("success")
      setMessage("Bet placed successfully!")
    } catch {
      setMessageType("error")
      setMessage("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className={mobile ? "fixed inset-x-3 bottom-3 z-[60] max-h-[75vh] overflow-auto rounded-2xl border border-border bg-card p-4 shadow-2xl" : "sticky top-20 hidden h-fit rounded-2xl border border-border bg-card p-4 shadow-lg xl:block"}>
      <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">Bet Slip <span className="text-primary">({selectionCount})</span></h2>{mobile ? <button onClick={onClose} className="p-1 text-muted-foreground"><X className="size-5" /></button> : <button onClick={clearSlip} className="text-xs text-muted-foreground hover:text-primary">Clear slip</button>}</div>
      <div className="mt-3 space-y-2">{selections.length === 0 ? <p className="rounded-lg bg-secondary/40 p-4 text-center text-sm text-muted-foreground">Your selections will appear here.</p> : selections.map((selection) => <div key={selection.id} className="rounded-lg border border-border bg-secondary/30 p-3"><div className="flex gap-2"><div className="min-w-0 flex-1"><p className="truncate text-xs text-muted-foreground">{selection.matchLabel}</p><p className="mt-0.5 text-sm font-semibold">{selection.selectionLabel} <span className="text-primary">@ {selection.odds.toFixed(2)}</span></p></div><button onClick={() => removeSelection(selection.id)} aria-label="Remove selection" className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></div></div>)}</div>
      <label className="mt-4 block text-xs font-medium text-muted-foreground">Stake (KSh)<input type="number" min="0" value={multiStake || ""} onChange={(e) => setMultiStake(Number(e.target.value))} placeholder="0.00" className="mt-1.5 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
      <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Total odds</span><b>{(combinedOdds ?? 1).toFixed(2)}</b></div><div className="flex justify-between"><span className="text-muted-foreground">Possible win</span><b className="text-primary">{formatKes(potentialReturn)}</b></div></div>{message && <p className={`mt-3 text-xs ${messageType === "success" ? "text-emerald-500" : messageType === "error" ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>}{isBalanceError && <Button variant="outline" className="mt-2 w-full gap-2 text-xs" onClick={() => router.push("/wallet?intent=deposit")}><Wallet className="size-4" /> Deposit Now</Button>}<Button className="mt-4 w-full font-bold" onClick={submit} disabled={loading}>{loading ? <><Loader2 className="mr-2 size-4 animate-spin" /> Placing...</> : "Place Bet"}</Button>{selections.length > 0 && <button onClick={clearSlip} className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground">Clear Slip</button>}
}
  const [open, setOpen] = useState(false); const { selectionCount } = useBetSlip()
  return <><div className="fixed bottom-4 right-4 z-40 hidden xl:block"><BetSlip /></div><button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg xl:hidden">Bet Slip {selectionCount > 0 && <span className="ml-1 rounded-full bg-background/25 px-1.5">{selectionCount}</span>}</button>{open && <BetSlip mobile onClose={() => setOpen(false)} />}</>
}
