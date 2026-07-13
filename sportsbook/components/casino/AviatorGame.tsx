"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket, History, Users, Minus, Plus } from "lucide-react"

// ============================================================
// AVIATOR-STYLE CRASH GAME — DEMO MODE
// Runs entirely client-side: fake starting balance, real RNG,
// real requestAnimationFrame timing. Nothing here is real money
// and nothing calls an external provider — this is the actual
// game logic, not a placeholder. When a real-money mode is added
// later, only bet placement / balance updates need to move to the
// wallet service; the game engine itself stays the same.
// ============================================================

type Phase = "waiting" | "running" | "crashed"

const WAITING_SECONDS = 5
const POST_CRASH_PAUSE_MS = 2800
const HOUSE_EDGE = 0.04
const QUICK_STAKES = [50, 100, 500, 1000]

function generateCrashPoint(): number {
  // Fat-tailed distribution: mostly low multipliers, occasional big ones.
  // r < houseEdge => instant crash at 1.00x (the "house always wins sometimes" case).
  const r = Math.random()
  if (r < HOUSE_EDGE) return 1.0
  const point = 0.99 / (1 - r)
  return Math.min(Math.max(1.0, Number(point.toFixed(2))), 1000)
}

function computeMultiplier(elapsedMs: number): number {
  // Quadratic-ish acceleration curve — slow start, steep climb.
  const t = elapsedMs / 1000
  return Number((1 + 0.06 * t * t + 0.15 * t).toFixed(2))
}

function historyColor(m: number) {
  if (m < 2) return "text-sky-300"
  if (m < 10) return "text-fuchsia-300"
  return "text-amber-300"
}

interface FakeBettor {
  name: string
  stake: number
  cashedOutAt: number | null
}

function generateFakeBettors(): FakeBettor[] {
  const names = ["J•254", "Wanjiru_K", "Mo***era", "T.Otieno", "Faith_M", "Brian**", "K_Njoroge", "A.Wambui"]
  return names
    .sort(() => Math.random() - 0.5)
    .slice(0, 5 + Math.floor(Math.random() * 3))
    .map((name) => ({
      name,
      stake: [20, 50, 100, 200, 500][Math.floor(Math.random() * 5)],
      cashedOutAt: null,
    }))
}

export default function AviatorGame() {
  const [balance, setBalance] = useState(10_000)
  const [displayBalance, setDisplayBalance] = useState(0)
  const [playCount, setPlayCount] = useState(0)
  const [hasDeposited, setHasDeposited] = useState(false)
  const [betAmount, setBetAmount] = useState(100)
  const [phase, setPhase] = useState<Phase>("waiting")
  const [multiplier, setMultiplier] = useState(1.0)
  const [countdown, setCountdown] = useState(WAITING_SECONDS)
  const [hasActiveBet, setHasActiveBet] = useState(false)
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null)
  const [roundResult, setRoundResult] = useState<"win" | "lose" | null>(null)
  const [history, setHistory] = useState<number[]>([2.14, 1.02, 5.67, 1.34, 11.2, 1.88, 3.01])
  const [autoCashout, setAutoCashout] = useState<string>("")
  const [fakeBettors, setFakeBettors] = useState<FakeBettor[]>(generateFakeBettors())

  const crashPointRef = useRef<number>(1)
  const startTimeRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasActiveBetRef = useRef(hasActiveBet)
  const cashedOutRef = useRef(cashedOutAt)
  const betAmountRef = useRef(betAmount)

  hasActiveBetRef.current = hasActiveBet
  cashedOutRef.current = cashedOutAt
  betAmountRef.current = betAmount

  // Check localStorage for deposit & play tracking
  useEffect(() => {
    const deposited = localStorage.getItem("aviator_has_deposited") === "true"
    const plays = parseInt(localStorage.getItem("aviator_play_count") || "0", 10)
    
    setHasDeposited(deposited)
    setPlayCount(plays)
    
    // Show balance only if deposited AND played 2+ times
    if (deposited && plays >= 2) {
      setDisplayBalance(balance)
    } else {
      setDisplayBalance(0)
    }
  }, [balance])

  // Track when a round completes (crashed) and increment play count
  useEffect(() => {
    if (phase === "crashed" && hasActiveBet) {
      const newPlayCount = playCount + 1
      setPlayCount(newPlayCount)
      localStorage.setItem("aviator_play_count", String(newPlayCount))
      
      // Check if conditions are met to unlock balance
      if (hasDeposited && newPlayCount >= 2) {
        setDisplayBalance(balance)
      }
    }
  }, [phase, hasActiveBet])

  const startWaitingPhase = useCallback(() => {
    setPhase("waiting")
    setMultiplier(1.0)
    setCashedOutAt(null)
    setRoundResult(null)
    setCountdown(WAITING_SECONDS)
    setFakeBettors(generateFakeBettors())

    let remaining = WAITING_SECONDS
    countdownRef.current = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current)
        startRunningPhase()
      }
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRunningPhase = useCallback(() => {
    crashPointRef.current = generateCrashPoint()
    startTimeRef.current = performance.now()
    setPhase("running")

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current
      const m = computeMultiplier(elapsed)

      // Simulate other players cashing out around plausible multipliers
      setFakeBettors((prev) =>
        prev.map((b) =>
          b.cashedOutAt === null && m > 1.1 && Math.random() < 0.01 * (m / 2)
            ? { ...b, cashedOutAt: m }
            : b
        )
      )

      const target = parseFloat(autoCashout)
      if (
        hasActiveBetRef.current &&
        cashedOutRef.current === null &&
        !Number.isNaN(target) &&
        target > 1 &&
        m >= target
      ) {
        doCashOut(m)
      }

      if (m >= crashPointRef.current) {
        setMultiplier(crashPointRef.current)
        crash(crashPointRef.current)
        return
      }

      setMultiplier(m)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCashout])

  const crash = useCallback((point: number) => {
    cancelAnimationFrame(rafRef.current)
    setPhase("crashed")
    setHistory((prev) => [point, ...prev].slice(0, 12))

    if (hasActiveBetRef.current && cashedOutRef.current === null) {
      setRoundResult("lose")
    }

    setTimeout(() => {
      setHasActiveBet(false)
      startWaitingPhase()
    }, POST_CRASH_PAUSE_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doCashOut = useCallback((atMultiplier: number) => {
    setCashedOutAt(atMultiplier)
    setRoundResult("win")
    setBalance((prev) => prev + betAmountRef.current * atMultiplier)
  }, [])

  useEffect(() => {
    startWaitingPhase()
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placeBet() {
    if (phase !== "waiting" || hasActiveBet || betAmount <= 0 || betAmount > balance) return
    setBalance((prev) => prev - betAmount)
    setHasActiveBet(true)
  }

  function cancelBet() {
    if (phase !== "waiting" || !hasActiveBet) return
    setBalance((prev) => prev + betAmount)
    setHasActiveBet(false)
  }

  function manualCashOut() {
    if (phase !== "running" || !hasActiveBet || cashedOutAt !== null) return
    doCashOut(multiplier)
  }

  const planeProgress = Math.min((multiplier - 1) / 9, 1) // visual travel 0..1 caps around 10x

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-sky-400/20 bg-[#081120] shadow-[0_24px_80px_-30px_rgba(14,165,233,0.55)]">
      {/* History strip */}
      <div className="flex items-center gap-2 border-b border-sky-300/10 bg-[#0c1a2f] px-4 py-3 overflow-x-auto scrollbar-hide">
        <History className="h-4 w-4 text-sky-300 shrink-0" />
        {history.map((m, i) => (
          <span
            key={i}
            className={`text-xs font-semibold shrink-0 ${historyColor(m)}`}
          >
            {m.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Game canvas area */}
      <div className="relative h-64 overflow-hidden bg-[#07101f]">
        {/* Ascending flight path glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,rgba(225,29,72,0.24),transparent_52%),radial-gradient(ellipse_at_85%_10%,rgba(56,189,248,0.16),transparent_42%)] transition-opacity duration-500"
          style={{ opacity: phase === "running" ? 1 : 0.45 }}
        />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(125,211,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.16)_1px,transparent_1px)] [background-size:26px_26px]" />

        {/* Plane */}
        <motion.div
          className="absolute"
          animate={{
            left: `${10 + planeProgress * 65}%`,
            bottom: `${10 + planeProgress * 60}%`,
            rotate: phase === "crashed" ? 25 : -15 + planeProgress * -10,
          }}
          transition={{ ease: "linear", duration: phase === "running" ? 0.05 : 0.3 }}
        >
          <motion.div
            animate={
              phase === "crashed"
                ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] }
                : { y: [0, -3, 0] }
            }
            transition={
              phase === "crashed"
                ? { duration: 0.6 }
                : { duration: 0.8, repeat: Infinity }
            }
          >
            <Rocket
              className={`h-8 w-8 ${
                phase === "crashed" ? "text-rose-500" : "text-rose-400"
              }`}
              fill="currentColor"
            />
          </motion.div>
        </motion.div>

        {/* Multiplier readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground mb-1">Next round in</p>
                <p className="text-4xl font-bold tabular-nums">{countdown}s</p>
              </motion.div>
            )}
            {phase === "running" && (
              <motion.p
                key="running"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold tabular-nums text-sky-200 drop-shadow-[0_0_24px_rgba(56,189,248,0.8)]"
              >
                {multiplier.toFixed(2)}x
              </motion.p>
            )}
            {phase === "crashed" && (
              <motion.div
                key="crashed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-sm text-rose-400 font-medium mb-1">FLEW AWAY</p>
                <p className="text-4xl font-bold tabular-nums text-rose-400">
                  {multiplier.toFixed(2)}x
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Round result toast */}
        <AnimatePresence>
          {roundResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold ${
                roundResult === "win"
                  ? "border border-sky-300/30 bg-sky-400/15 text-sky-100"
                  : "border border-rose-400/30 bg-rose-400/15 text-rose-100"
              }`}
            >
              {roundResult === "win"
                ? `Cashed out at ${cashedOutAt?.toFixed(2)}x`
                : "Better luck next round"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live bettors */}
      <div className="max-h-24 overflow-y-auto border-y border-sky-300/10 bg-[#0c1a2f]/80 px-4 py-2 scrollbar-hide">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>{fakeBettors.length} players betting</span>
        </div>
        <div className="space-y-1">
          {fakeBettors.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{b.name}</span>
              <span className="tabular-nums">KES {b.stake}</span>
              <span
                className={
              b.cashedOutAt ? "font-medium text-sky-300" : "text-muted-foreground"
                }
              >
                {b.cashedOutAt ? `${b.cashedOutAt.toFixed(2)}x` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 bg-[#0a1528] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Balance</span>
          <div className="flex flex-col items-end">
            <span className="font-semibold tabular-nums">
              KES {displayBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            {displayBalance === 0 && (
              <span className="text-xs text-muted-foreground mt-0.5">
                {hasDeposited ? `Play 2 times (${playCount}/2)` : "Deposit first"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBetAmount((v) => Math.max(10, v - 10))}
            disabled={hasActiveBet}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300/15 bg-sky-950/40 hover:border-sky-300/50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={betAmount}
            disabled={hasActiveBet}
            onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
            className="h-9 flex-1 rounded-lg border border-sky-300/15 bg-[#07101f] px-3 text-center font-semibold tabular-nums focus:border-sky-300/60 disabled:opacity-60"
          />
          <button
            onClick={() => setBetAmount((v) => v + 10)}
            disabled={hasActiveBet}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300/15 bg-sky-950/40 hover:border-sky-300/50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          {QUICK_STAKES.map((v) => (
            <button
              key={v}
              onClick={() => setBetAmount(v)}
              disabled={hasActiveBet}
              className="flex-1 rounded-lg border border-sky-300/15 bg-sky-950/30 py-1.5 text-xs hover:border-sky-300/50 disabled:opacity-40"
            >
              {v}
            </button>
          ))}
        </div>

        <input
          type="number"
          placeholder="Auto cash-out at (optional)"
          value={autoCashout}
          onChange={(e) => setAutoCashout(e.target.value)}
          className="h-9 w-full rounded-lg border border-sky-300/15 bg-[#07101f] px-3 text-sm placeholder:text-muted-foreground focus:border-sky-300/60"
        />

        {phase === "running" && hasActiveBet && cashedOutAt === null ? (
          <button
            onClick={manualCashOut}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-300 to-cyan-300 text-lg font-extrabold text-slate-950 shadow-lg shadow-sky-400/20 transition hover:brightness-110"
          >
            CASH OUT — KES {(betAmount * multiplier).toFixed(0)}
          </button>
        ) : hasActiveBet && phase === "waiting" ? (
          <button
            onClick={cancelBet}
            className="h-12 w-full rounded-xl border border-sky-300/30 bg-sky-950/40 font-semibold hover:bg-sky-900/50 transition"
          >
            Cancel Bet
          </button>
        ) : (
          <button
            onClick={placeBet}
            disabled={phase !== "waiting" || betAmount <= 0 || betAmount > balance}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-lg font-extrabold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 disabled:opacity-40"
          >
            {phase === "waiting" ? "PLACE BET" : "Bet locked in — round in progress"}
          </button>
        )}
      </div>
    </div>
  )
}
