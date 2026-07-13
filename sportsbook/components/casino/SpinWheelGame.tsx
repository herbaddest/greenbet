"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

// ============================================================
// SPIN & WIN — DEMO MODE
// Fully playable prize wheel. Real weighted RNG picks the outcome
// segment first, then the wheel's rotation is calculated to land
// exactly on that segment — this is how real prize wheels work
// (the visual spin is deterministic once the outcome is chosen,
// not the other way around). Fake in-memory balance, no external
// provider required for demo mode.
// ============================================================

interface Segment {
  label: string
  multiplier: number // 0 = lose stake, otherwise stake * multiplier returned
  weight: number // relative probability weight
  color: string
}

const SEGMENTS: Segment[] = [
  { label: "0x", multiplier: 0, weight: 30, color: "#182338" },
  { label: "1.5x", multiplier: 1.5, weight: 22, color: "#2563eb" },
  { label: "0x", multiplier: 0, weight: 20, color: "#182338" },
  { label: "2x", multiplier: 2, weight: 14, color: "#7c3aed" },
  { label: "0.5x", multiplier: 0.5, weight: 8, color: "#b45309" },
  { label: "5x", multiplier: 5, weight: 4, color: "#f59e0b" },
  { label: "0x", multiplier: 0, weight: 12, color: "#182338" },
  { label: "10x", multiplier: 10, weight: 1.5, color: "#fbbf24" },
  { label: "3x", multiplier: 3, weight: 6, color: "#db2777" },
  { label: "50x", multiplier: 50, weight: 0.15, color: "#fef3c7" },
]

const SEGMENT_ANGLE = 360 / SEGMENTS.length
const QUICK_STAKES = [20, 50, 100, 250]

function pickWeightedSegment(): { segment: Segment; index: number } {
  const totalWeight = SEGMENTS.reduce((sum, s) => sum + s.weight, 0)
  let r = Math.random() * totalWeight
  for (let i = 0; i < SEGMENTS.length; i++) {
    r -= SEGMENTS[i].weight
    if (r <= 0) return { segment: SEGMENTS[i], index: i }
  }
  return { segment: SEGMENTS[SEGMENTS.length - 1], index: SEGMENTS.length - 1 }
}

export default function SpinWheelGame() {
  const [balance, setBalance] = useState(10_000)
  const [displayBalance, setDisplayBalance] = useState(0)
  const [playCount, setPlayCount] = useState(0)
  const [hasDeposited, setHasDeposited] = useState(false)
  const [stake, setStake] = useState(50)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<{ label: string; win: number } | null>(null)
  const [history, setHistory] = useState<Segment[]>([])

  const rotationRef = useRef(0)

  // Check localStorage for deposit & play tracking
  useEffect(() => {
    const deposited = localStorage.getItem("spin_has_deposited") === "true"
    const plays = parseInt(localStorage.getItem("spin_play_count") || "0", 10)
    
    setHasDeposited(deposited)
    setPlayCount(plays)
    
    // Show balance only if deposited AND played 2+ times
    if (deposited && plays >= 2) {
      setDisplayBalance(balance)
    } else {
      setDisplayBalance(0)
    }
  }, [balance])

  // Track when a spin completes and increment play count
  useEffect(() => {
    if (result) {
      const newPlayCount = playCount + 1
      setPlayCount(newPlayCount)
      localStorage.setItem("spin_play_count", String(newPlayCount))
      
      // Check if conditions are met to unlock balance
      if (hasDeposited && newPlayCount >= 2) {
        setDisplayBalance(balance)
      }
    }
  }, [result])

  const spin = useCallback(() => {
    if (isSpinning || stake <= 0 || stake > balance) return

    setBalance((prev) => prev - stake)
    setResult(null)
    setIsSpinning(true)

    const { segment, index } = pickWeightedSegment()

    // Land the pointer (fixed at top, 0deg) on the middle of the chosen segment.
    // Add multiple full rotations for a satisfying spin, plus small random jitter
    // within the segment so it doesn't look robotically centered every time.
    const segmentCenter = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.6)
    const extraSpins = 5 + Math.floor(Math.random() * 3) // 5-7 full turns
    const targetRotation =
      rotationRef.current +
      extraSpins * 360 +
      (360 - segmentCenter - jitter) // rotate wheel so segment lands under top pointer

    rotationRef.current = targetRotation
    setRotation(targetRotation)

    setTimeout(() => {
      const winAmount = stake * segment.multiplier
      setBalance((prev) => prev + winAmount)
      setResult({ label: segment.label, win: winAmount })
      setHistory((prev) => [segment, ...prev].slice(0, 10))
      setIsSpinning(false)
    }, 4200) // matches the CSS transition duration below
  }, [isSpinning, stake, balance])

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-violet-400/25 bg-[#100c22] shadow-[0_24px_80px_-30px_rgba(168,85,247,0.65)]">
      {/* History strip */}
      <div className="flex items-center gap-2 border-b border-violet-300/15 bg-[#1a1236] px-4 py-3 overflow-x-auto scrollbar-hide">
        <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
        {history.length === 0 && (
          <span className="text-xs text-muted-foreground">No spins yet</span>
        )}
        {history.map((s, i) => (
          <span
            key={i}
            className="text-xs font-semibold shrink-0"
            style={{ color: s.multiplier === 0 ? "var(--muted-foreground)" : s.color }}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Wheel area */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(124,58,237,0.38),transparent_44%),linear-gradient(135deg,#17103a,#0d132b)] py-8">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(251,191,36,0.5)_1px,transparent_1px)] [background-size:18px_18px]" />
        {/* Pointer */}
        <div
          className="absolute top-4 z-10 w-0 h-0"
          style={{
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "16px solid #fbbf24",
            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.65))",
          }}
        />

        <div className="relative z-10 h-64 w-64 rounded-full p-1.5 shadow-[0_0_0_2px_rgba(251,191,36,0.5),0_0_32px_rgba(168,85,247,0.55)]">
          <motion.svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 4.2, ease: [0.17, 0.67, 0.32, 1] }}
          >
            {SEGMENTS.map((seg, i) => {
              const startAngle = (i * SEGMENT_ANGLE * Math.PI) / 180
              const endAngle = ((i + 1) * SEGMENT_ANGLE * Math.PI) / 180
              const cx = 100
              const cy = 100
              const r = 98
              const x1 = cx + r * Math.sin(startAngle)
              const y1 = cy - r * Math.cos(startAngle)
              const x2 = cx + r * Math.sin(endAngle)
              const y2 = cy - r * Math.cos(endAngle)
              const midAngle = (startAngle + endAngle) / 2
              const labelX = cx + (r * 0.65) * Math.sin(midAngle)
              const labelY = cy - (r * 0.65) * Math.cos(midAngle)

              return (
                <g key={i}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth={1}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    fill={seg.multiplier >= 5 ? "#0a0a0a" : "#e5e5e5"}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${(midAngle * 180) / Math.PI}, ${labelX}, ${labelY})`}
                  >
                    {seg.label}
                  </text>
                </g>
              )
            })}
            <circle cx="100" cy="100" r="10" fill="var(--background, #0a0a0a)" stroke="rgba(255,255,255,0.2)" />
          </motion.svg>
        </div>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mx-4 mt-3 rounded-lg px-3 py-2 text-center text-sm font-semibold ${
            result.win > 0
            ? "border border-amber-300/30 bg-amber-300/15 text-amber-100"
            : "border border-rose-400/30 bg-rose-400/15 text-rose-100"
          }`}
        >
          {result.win > 0
            ? `Landed on ${result.label} — won KES ${result.win.toFixed(0)}`
            : `Landed on ${result.label} — no win this time`}
        </motion.div>
      )}

      {/* Controls */}
      <div className="space-y-3 bg-[#130d29] p-4">
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

        <input
          type="number"
          value={stake}
          disabled={isSpinning}
          onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
          className="h-9 w-full rounded-lg border border-violet-300/20 bg-[#0c1022] px-3 text-center font-semibold tabular-nums focus:border-violet-300/60 disabled:opacity-60"
        />

        <div className="flex gap-2">
          {QUICK_STAKES.map((v) => (
            <button
              key={v}
              onClick={() => setStake(v)}
              disabled={isSpinning}
              className="flex-1 rounded-lg border border-violet-300/20 bg-violet-950/25 py-1.5 text-xs hover:border-amber-300/60 disabled:opacity-40"
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || stake <= 0 || stake > balance}
          className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 text-lg font-extrabold text-slate-950 shadow-lg shadow-amber-400/20 hover:brightness-110 transition disabled:opacity-40"
        >
          {isSpinning ? "Spinning…" : `SPIN — KES ${stake}`}
        </button>
      </div>
    </div>
  )
}
