"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/contexts/AuthContext"

export function CasinoGamePage({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter(); const { user, isLoading } = useAuth(); const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace("/register?next=" + encodeURIComponent(location.pathname)); return }
    // The existing Aviator and Spin engines run in the browser, so they are
    // immediately playable once an account exists. A provider-backed wallet
    // integration can replace this boundary when real-money casino play ships.
    setAllowed(true)
  }, [isLoading, router, user])
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-primary">Casino</p><h1 className="mt-1 font-display text-3xl font-bold">{title}</h1></div>{allowed ? children : <div className="glass rounded-2xl p-8 text-center text-muted-foreground">Preparing your game…</div>}</main><SiteFooter /></div>
}
