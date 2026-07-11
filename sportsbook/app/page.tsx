import { SiteHeader } from '@/components/site-header'
import { HeroSection } from '@/components/hero-section'
import { PopularSports } from '@/components/popular-sports'
import { LiveMatches } from '@/components/live-matches'
import { UpcomingMatches } from '@/components/upcoming-matches'
import { PopularBets } from '@/components/popular-bets'
import { VetaSection } from '@/components/veta-section'
import { SpinWin } from '@/components/spin-win'
import { Promotions } from '@/components/promotions'
import { WhyChooseUs } from '@/components/why-choose-us'
import { SiteFooter } from '@/components/site-footer'
import { SportsbookDashboard } from '@/components/sportsbook-dashboard'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HeroSection />
        <PopularSports />
        <LiveMatches />
        <UpcomingMatches />
        <PopularBets />
        <VetaSection />
        <SpinWin />
        <Promotions />
        <WhyChooseUs />
      </main>
      <SiteFooter />
      <SportsbookDashboard />
    </div>
  )
}
