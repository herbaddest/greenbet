import { LiveMatches } from "@/components/live-matches"

export default function LivePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Live Matches</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every football match currently in play, updated in real time.
        </p>
      </div>
      <LiveMatches />
    </main>
  )
}