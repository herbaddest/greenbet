"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { BetSlipProvider } from "@/contexts/BetSlipContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider><BetSlipProvider>{children}</BetSlipProvider></AuthProvider>
}
