"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/contexts/AuthContext"
import { getNotifications } from "@/services/notification.service"
import type { AppNotification } from "@/types"

export default function NotificationsPage() {
  const { user } = useAuth(); const [items, setItems] = useState<AppNotification[]>([])
  useEffect(() => { if (user) void getNotifications(user.id).then(setItems) }, [user])
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><h1 className="font-display text-3xl font-bold">Notifications</h1><div className="mt-6 space-y-3">{items.length ? items.map((item) => <article key={item.id} className="glass rounded-xl p-4"><div className="flex justify-between gap-4"><h2 className="font-semibold">{item.title}</h2>{!item.isRead && <span className="size-2 rounded-full bg-primary" />}</div><p className="mt-1 text-sm text-muted-foreground">{item.message}</p></article>) : <p className="rounded-xl border border-border p-8 text-center text-muted-foreground">You&apos;re all caught up.</p>}</div></main><SiteFooter /></div>
}
