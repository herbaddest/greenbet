"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { depositFunds, withdrawFunds } from "@/services/wallet.service"

export function AccountModal({ type, onClose }: { type: "deposit" | "withdraw"; onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const isDeposit = type === "deposit"

 async function submit(e: React.FormEvent) {
  e.preventDefault();

  setError("");
  setSuccess(false);

  const formattedPhone = phone
    .replace(/\s/g, "")
    .replace(/^0/, "254")
    .replace(/^\+/, "");

  if (!/^254\d{9}$/.test(formattedPhone)) {
    setError("Enter a valid Kenyan phone number.");
    return;
  }

  if (Number(amount) < 100) {
    setError("Minimum amount is KSh 100.");
    return;
  }

  setLoading(true);

  try {
    if (isDeposit) {
      const res = await fetch("/api/payments/optimapay/stk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: Number(amount),
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setLoading(false);
        setError(result.message ?? "Failed to send STK Push.");
        return;
      }

      const checkoutRequestId = result.checkout_request_id;

      const interval = setInterval(async () => {
        const statusRes = await fetch("/api/payments/optimapay/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkout_request_id: checkoutRequestId,
          }),
        });

        const status = await statusRes.json();

        console.log("Payment Status:", status);

        if (status.status === "completed") {
          clearInterval(interval);

          setSuccess(true);
          setLoading(false);

          // TODO: credit wallet here

          setTimeout(() => onClose(), 1500);
        }

        if (status.status === "failed") {
          clearInterval(interval);

          setLoading(false);
          setError("Payment failed.");
        }
      }, 5000);
    } else {
      const result = await withdrawFunds(
        Number(amount),
        `MPESA-${Date.now()}`,
        `M-Pesa withdrawal to ${phone}`
      );

      if (!result.success) {
        setLoading(false);
        setError(result.error ?? "Withdrawal failed.");
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => onClose(), 1500);
    }
  } catch (err) {
    console.error(err);
    setLoading(false);
    setError("Network error. Please try again.");
  }
}
      
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={isDeposit ? "Deposit" : "Withdraw"}>
    <form onSubmit={submit} className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">M-Pesa</p><h2 className="mt-1 font-display text-2xl font-bold">{isDeposit ? "Deposit" : "Withdraw"}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-5" /></button></div>
      <p className="mt-3 text-sm text-muted-foreground">{isDeposit ? "You will receive an M-Pesa prompt to complete this deposit." : "Withdrawals are sent to your M-Pesa number after validation."}</p>
      <label className="mt-5 block text-sm font-medium">Phone number<input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="mt-2 w-full rounded-lg border border-border bg-secondary/50 px-3 py-3 outline-none focus:border-primary" /></label>
          <input required min="100" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-2 w-full rounded-lg border border-border bg-secondary/50 px-3 py-3 outline-none focus:border-primary" />
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-500">Transaction successful!</p>}
      <div className="mt-6 flex gap-3">
  <Button
    type="button"
    variant="outline"
    className="flex-1"
    onClick={onClose}
    disabled={loading}
  >
    Cancel
  </Button>

  <Button
    type="submit"
    className="flex-1"
    disabled={loading || success}
  >
    {loading ? (
      <>
        <Loader2 className="mr-2 size-4 animate-spin" />
        Processing...
      </>
    ) : success ? (
      "Done"
    ) : (
      "Continue"
    )}
  </Button>
</div>
    </form>
  </div>

}