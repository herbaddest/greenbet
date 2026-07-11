"use client"

import { useEffect, useState } from "react"
import { Bell, ChevronDown, Menu, Wallet, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { AccountModal } from "@/components/account-modal"
import { navItems } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { getWallet, formatKes } from "@/services/wallet.service"
import { getNotifications } from "@/services/notification.service"

export function SiteHeader() {
  const [open, setOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [modal, setModal] = useState<"deposit" | "withdraw" | null>(null)
  const [balance, setBalance] = useState(0); const [unread, setUnread] = useState(0)
  const { user, isAuthenticated, logout } = useAuth(); const router = useRouter()
  useEffect(() => { if (!user) return; void getWallet(user.id).then((w) => setBalance(w.main)); void getNotifications(user.id).then((n) => setUnread(n.filter((item) => !item.isRead).length)) }, [user])
  async function signOut() { await logout(); setProfileOpen(false); router.push("/") }
  const accountLinks = [{ label: "Profile", href: "/profile" }, { label: "Wallet", href: "/wallet" }, { label: "Bet History", href: "/bets" }, { label: "Settings", href: "/profile#settings" }]
  return <>
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-8"><Logo /><nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">{navItems.map((item) => <a key={item.label} href={item.href} className="group flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{item.live && <span className="size-1.5 rounded-full bg-primary" />}{item.label}</a>)}</nav></div>
      <div className="flex items-center gap-2 sm:gap-3">{isAuthenticated ? <><button onClick={() => router.push("/wallet")} className="hidden items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2 text-sm font-semibold sm:flex"><Wallet className="size-4 text-primary" />{formatKes(balance)}</button><Button size="sm" onClick={() => setModal("deposit")}>Deposit</Button><Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setModal("withdraw")}>Withdraw</Button><button onClick={() => router.push("/notifications")} className="relative rounded-lg p-2 hover:bg-secondary" aria-label="Notifications"><Bell className="size-5" />{unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{unread}</span>}</button><div className="relative hidden sm:block"><button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium hover:bg-secondary">{user?.fullName}<ChevronDown className="size-4" /></button>{profileOpen && <div className="absolute right-0 top-11 w-48 rounded-xl border border-border bg-card p-1 shadow-xl">{accountLinks.map((item) => <Link key={item.label} href={item.href} onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary">{item.label}</Link>)}<button onClick={() => setModal("deposit")} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">Deposit</button><button onClick={() => setModal("withdraw")} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary">Withdraw</button><button onClick={signOut} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-secondary">Logout</button></div>}</div></> : <><Link href="/login"><Button variant="ghost" size="lg" className="hidden sm:inline-flex">Login</Button></Link><Link href="/register"><Button size="lg" className="hidden font-semibold shadow-[0_0_20px] shadow-primary/25 sm:inline-flex">Register</Button></Link></>}<Button variant="outline" size="icon" className="lg:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? <X /> : <Menu />}</Button></div></div>
      <div className={cn("overflow-hidden border-t border-border/80 lg:hidden", open ? "max-h-[30rem]" : "max-h-0", "transition-[max-height] duration-300 ease-in-out")}><nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">{navItems.map((item) => <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">{item.label}</a>)}<div className="mt-3 flex gap-2">{isAuthenticated ? <><Button className="flex-1" onClick={() => setModal("deposit")}>Deposit</Button><Button variant="outline" className="flex-1" onClick={signOut}>Logout</Button></> : <><Link href="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link><Link href="/register" className="flex-1"><Button className="w-full">Register</Button></Link></>}</div></nav></div></header>
    {modal && <AccountModal type={modal} onClose={() => setModal(null)} />}</>
}
