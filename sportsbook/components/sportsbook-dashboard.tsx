"use client"

import { BetSlipDock } from "@/components/bet-slip"
import { useAuth } from "@/contexts/AuthContext"

export function SportsbookDashboard() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <BetSlipDock /> : null
}
