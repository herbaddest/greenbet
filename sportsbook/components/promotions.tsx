"use client"

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { promotions } from '@/lib/data'
import { useAuth } from '@/contexts/AuthContext'

export function Promotions() {
  const router = useRouter(); const { user } = useAuth(); const [notice, setNotice] = useState('')
  async function action(index: number) {
    if (!user) return router.push('/register?next=/promotions')
    if (index === 0) return router.push('/wallet?intent=deposit&next=/promotions')
    if (index === 1) return router.push('/#live')
    try { await navigator.clipboard.writeText(`GREEN-${user.id.slice(0, 6).toUpperCase()}`); setNotice('Your referral code has been copied.') } catch { setNotice('Your referral code: GREEN-' + user.id.slice(0, 6).toUpperCase()) }
  }
  return <section id="promotions" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"><SectionHeading eyebrow="Boost your bankroll" title="Promotions" />{notice && <p className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{notice}</p>}<div className="grid grid-cols-1 gap-4 md:grid-cols-3">{promotions.map((promo, index) => <article key={promo.title} className="group glass flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:border-primary/40"><div className="relative flex h-28 items-end bg-gradient-to-br from-primary/25 via-primary/10 to-transparent p-4"><span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-semibold text-primary backdrop-blur">{promo.tag}</span></div><div className="flex flex-1 flex-col p-5"><h3 className="font-display text-xl font-bold">{promo.title}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{promo.description}</p><Button variant="ghost" size="lg" onClick={() => void action(index)} className="mt-4 w-fit gap-1 px-0 text-primary hover:bg-transparent hover:text-primary">{promo.cta}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Button></div></article>)}</div></section>
}
