"use client"

import { useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, Trophy, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { placeBet } from "@/services/bet.service"
import { formatKes, getWallet } from "@/services/wallet.service"
import { vetaTickets } from "@/lib/data"

// ============================================================
// VETA JACKPOT TICKET
// vetaTickets (lib/data.ts) only stores a match COUNT per ticket
// (e.g. 13), not real individual fixtures — there was never an
// underlying data source for actual matches to pick outcomes for.
// This page generates placeholder pick rows for demo purposes,
// seeded once per ticket so odds stay stable across re-renders
// instead of shuffling on every keystroke. Building this out with
// real fixtures later just means swapping MOCK_PICK_LABELS/odds
// generation for a real per-ticket matches data source — the
// pick/stake/submit flow below doesn't need to change.
// ============================================================

const PICK_OPTIONS = ["1", "X", "2"] as const

function seededOdds(seed: number): Record<(typeof PICK_OPTIONS)[number], number> {
  // Deterministic pseudo-random spread so odds look plausible but
  // don't change between renders for the same match index.
  const rand = (n: number) => {
    const x = Math.sin(seed * 999 + n) * 10000
    return x - Math.floor(x)
  }
  return {
    "1": Number((1.4 + rand(1) * 2.2).toFixed(2)),
    X: Number((2.8 + rand(2) * 1.4).toFixed(2)),
    "2": Number((1.4 + rand(3) * 2.6).toFixed(2)),
  }
}

export default function VetaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const ticketId = searchParams.get("ticket")
  const ticket = vetaTickets.find((t) => t.id === ticketId) ?? vetaTickets[0]

  const rows = useMemo(
    () =>
      Array.from({ length: ticket.matches }, (_, i) => ({
        index: i,
        label: `Fixture ${i + 1}`,
        odds: seededOdds(i),
      })),
    [ticket.matches]
  )

  const [picks, setPicks] = useState<Record<number, { label: string; odds: number }>>({})
  const [stake, setStake] = useState(50)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [isBalanceError, setIsBalanceError] = useState(false)
  const [loading, setLoading] = useState(false)

  const allPicked = rows.every((r) => picks[r.index])
  const totalOdds = allPicked
    ? Number(rows.reduce((acc, r) => acc * picks[r.index].odds, 1).toFixed(2))
    : 0
  const potentialReturn = allPicked ? Number((stake * totalOdds).toFixed(2)) : 0

  function selectPick(rowIndex: number, label: string, odds: number) {
    setPicks((prev) => ({ ...prev, [rowIndex]: { label, odds } }))
  }

  async function submit() {
    if (!isAuthenticated || !user) {
      return router.push(`/register?next=/veta?ticket=${ticket.id}`)
    }
    if (!allPicked) {
      setMessageType("error")
      setMessage(`Pick an outcome for all ${ticket.matches} fixtures to continue.`)
      return
    }
    if (stake < 10) {
      setMessageType("error")
      setMessage("Minimum stake is KSh 10.")
      return
    }

    setLoading(true)
    setMessage("")
    setIsBalanceError(false)

    try {
      const wallet = await getWallet(user.id)
      if (wallet.main < stake) {
        setMessageType("error")
        setIsBalanceError(true)
        setMessage(
          `Insufficient balance. You need ${formatKes(stake)} but only have ${formatKes(wallet.main)}.`
        )
        setLoading(false)
        return
      }

      const betId = `veta_${ticket.id}_${user.id}_${Date.now()}`
      const result = await placeBet({
        betId,
        stake,
        totalOdds,
        potentialReturn,
        selections: rows.map((r) => ({
          id: `${ticket.id}-${r.index}`,
          matchLabel: r.label,
          selectionLabel: picks[r.index].label,
          odds: picks[r.index].odds,
        })),
      })

      if (!result.success) {
        setMessageType("error")
        if (result.error?.includes("Insufficient balance")) {
          setIsBalanceError(true)
          setMessage("Insufficient balance. Please deposit funds.")
        } else {
          setMessage(result.error ?? "Your ticket could not be saved. Please try again.")
        }
        setLoading(false)
        return
      }

      setMessageType("success")
      setMessage("Your Veta ticket has been submitted. Good luck!")
      setPicks({})
    } catch {
      setMessageType("error")
      setMessage("Your ticket could not be saved. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <div className="glass flex items-center gap-4 rounded-2xl p-5">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Trophy className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">{ticket.title}</h1>
            <p className="text-sm text-muted-foreground">
              {ticket.matches} fixtures · Closes in {ticket.closesIn} · Jackpot{" "}
              <span className="font-semibold text-primary">{ticket.jackpot}</span>
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
          Demo fixtures — real match data for Veta tickets isn&apos;t wired up yet. Picks and
          stakes below are fully functional and will place a real bet against your wallet.
        </p>

        <div className="mt-6 space-y-2">
          {rows.map((row) => (
            <div key={row.index} className="glass rounded-xl p-3">
              <p className="mb-2 text-sm font-semibold">{row.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {PICK_OPTIONS.map((label) => {
                  const odds = row.odds[label]
                  const active = picks[row.index]?.label === label
                  return (
                    <button
                      key={label}
                      onClick={() => selectPick(row.index, label, odds)}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border py-2 text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-secondary/40 hover:border-primary/40"
                      }`}
                    >
                      <span className="text-[10px] font-normal text-muted-foreground">{label}</span>
                      <span className="font-semibold tabular-nums">{odds.toFixed(2)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="glass mt-6 rounded-2xl p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stake</span>
            <input
              type="number"
              min={10}
              value={stake}
              onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
              className="w-28 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-right font-semibold tabular-nums"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total odds</span>
            <b>{totalOdds > 0 ? totalOdds.toFixed(2) : "—"}</b>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Potential win</span>
            <b className="text-primary">{formatKes(potentialReturn)}</b>
          </div>

          {message && (
            <p
              className={`mt-3 text-xs ${
                messageType === "success"
                  ? "text-emerald-500"
                  : messageType === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {message}
            </p>
          )}

          {isBalanceError && (
            <Button
              variant="outline"
              className="mt-2 w-full gap-2 text-xs"
              onClick={() => router.push("/wallet?intent=deposit")}
            >
              <Wallet className="size-4" /> Deposit Now
            </Button>
          )}

          <Button className="mt-4 w-full font-bold" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}