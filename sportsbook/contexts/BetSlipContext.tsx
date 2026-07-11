"use client"

import { createContext, useContext, useMemo, useState } from "react"

export type Selection = {
  id: string
  matchLabel: string
  selectionLabel: string
  odds: number
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
  clearSlip: () => void

  placeBet: () => Promise<any>
}

const BetSlipContext = createContext<BetSlipContextType | null>(null)

export function BetSlipProvider({
  children,
}: {
  children: React.ReactNode
}) {
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

  function clearSlip() {
    setSelections([])
    setMultiStake(0)
  }

  const combinedOdds = useMemo(() => {
    if (!selections.length) return 1
    return selections.reduce((acc, s) => acc * s.odds, 1)
  }, [selections])

  const potentialReturn = combinedOdds * multiStake

  async function placeBet() {
    if (!selections.length || multiStake <= 0) return null

    return {
      selections,
      stake: multiStake,
      totalOdds: combinedOdds,
      potentialReturn,
    }
  }

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