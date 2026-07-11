"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccountModal({ type, onClose }: { type: "deposit" | "withdraw"; onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const isDeposit = type === "deposit"
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\+?254\d{9}$/.test(phone.replace(/\s/g, ""))) return setError("Enter a valid Kenyan phone number.")
    if (Number(amount) < 10) return setError("Minimum amount is KSh 10.")
    setError("")
    // The validated payload is intentionally kept at this boundary so an M-Pesa STK endpoint can be connected here.
    onClose()
  }
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={isDeposit ? "Deposit" : "Withdraw"}>
    <form onSubmit={submit} className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">M-Pesa</p><h2 className="mt-1 font-display text-2xl font-bold">{isDeposit ? "Deposit" : "Withdraw"}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-5" /></button></div>
      <p className="mt-3 text-sm text-muted-foreground">{isDeposit ? "You will receive an M-Pesa prompt to complete this deposit." : "Withdrawals are sent to your M-Pesa number after validation."}</p>
      <label className="mt-5 block text-sm font-medium">Phone number<input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="mt-2 w-full rounded-lg border border-border bg-secondary/50 px-3 py-3 outline-none focus:border-primary" /></label>
      <label className="mt-4 block text-sm font-medium">Amount (KSh)<input required min="10" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-2 w-full rounded-lg border border-border bg-secondary/50 px-3 py-3 outline-none focus:border-primary" /></label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button><Button className="flex-1">Continue</Button></div>
    </form>
  </div>
}
