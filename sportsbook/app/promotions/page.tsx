import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Promotions } from '@/components/promotions'

export default function PromotionsPage() {
  return <div className="min-h-screen bg-background"><SiteHeader /><main><Promotions /></main><SiteFooter /></div>
}
