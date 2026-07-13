"use client"

import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { placeBet as placeBetService } from "@/services/bet.service"

export type Selection = {
  id: string
  matchId: string
  matchLabel: string
  marketName: string
  selectionLabel: string
  odds: number
  isLive: boolean
}

type BetSlipContextType = {
  selections: Selection[]
  selectionCount: number
  combinedOdds: number
  multiStake: number
  potentialReturn: number

  setMultiStake: (stake: number) => void
  addSelection: (selection: Selection) => void
  removeSelection: (id: string) => void
  isSelected: (id: string) => boolean
  clearSlip: () => void

  placeBet: () => Promise<{ success: boolean; error?: string } | null>
}

const BetSlipContext = createContext<BetSlipContextType | null>(null)

export function BetSlipProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [selections, setSelections] = useState<Selection[]>([])
  const [multiStake, setMultiStake] = useState(0)

  function addSelection(selection: Selection) {
    setSelections((prev) => {
      const exists = prev.find((s) => s.id === selection.id)
      if (exists) return prev
      return [...prev, selection]
    })
  }

  function removeSelection(id: string) {
    setSelections((prev) => prev.filter((s) => s.id !== id))
  }

  function isSelected(id: string) {
    return selections.some((s) => s.id === id)
  }

  function clearSlip() {
    setSelections([])
    setMultiStake(0)
  }

  const combinedOdds = useMemo(() => {
    if (!selections.length) return 1
    return selections.reduce((acc, s) => acc * s.odds, 1)
  }, [selections])

  const potentialReturn = combinedOdds * multiStake
  const placeBet = useCallback(async () => {
    if (!selections.length || multiStake <= 0) return null
    if (!user) return { success: false, error: "Not authenticated" }

    // Generate a unique bet ID: user-timestamp-random
    const betId = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const result = await placeBetService({
      betId,
      stake: multiStake,
      totalOdds: combinedOdds,
      potentialReturn,
      selections: selections.map((s) => ({
        id: s.id,
        matchLabel: s.matchLabel,
        selectionLabel: s.selectionLabel,
        odds: s.odds,
      })),
    })

    if (result.success) {
      clearSlip()
    }

    return result
  }, [selections, multiStake, combinedOdds, potentialReturn, user])

  return (
    <BetSlipContext.Provider
      value={{
        selections,
        selectionCount: selections.length,
        combinedOdds,
        multiStake,
        potentialReturn,
        setMultiStake,
        addSelection,
        removeSelection,
        isSelected,
        clearSlip,
        placeBet,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  )
}

export function useBetSlip() {
  const context = useContext(BetSlipContext)

  if (!context) {
    throw new Error("useBetSlip must be used inside BetSlipProvider")
  }

  return context
}