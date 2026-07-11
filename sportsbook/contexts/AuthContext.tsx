"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import type { UserProfile } from "@/types"
import { supabase } from "@/lib/supabase"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): UserProfile {
  return {
    id: authUser.id,
    fullName: String(authUser.user_metadata?.full_name ?? authUser.email?.split("@")[0] ?? "Player"),
    email: authUser.email ?? "",
    phoneNumber: String(authUser.user_metadata?.phone ?? ""),
    kycStatus: "unverified", vipTier: "bronze", vipPoints: 0,
    joinedAt: new Date().toISOString(), responsibleGaming: {},
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)

  const syncSession = useCallback(async () => {
    // getSession reads the persisted browser session and does not make a
    // validation request on every page hydration. The auth-state subscription
    // below still keeps this in sync after sign-in, sign-out, or token refresh.
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }
    setUser(data.session?.user ? toProfile(data.session.user) : null)
    setIsAuthenticated(Boolean(data.session?.user))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void Promise.resolve().then(syncSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toProfile(session.user) : null)
      setIsAuthenticated(Boolean(session?.user))
      setIsLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [syncSession])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login: syncSession, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
