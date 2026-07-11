import type { CasinoCategory, CasinoGame, CasinoProvider } from "@/types"

// ============================================================
// MOCK CASINO SERVICE
// Casino is demo-only per project spec — no real-money provider
// integration. These functions simulate network latency and
// return realistic mock data so the UI is already shaped correctly
// for a future integration with Slotegrator's APIgrator, a unified
// aggregator API that provides game content from many providers
// (Pragmatic Play, Evolution, NetEnt, Playtech, Spribe, Ezugi, etc.)
// through a single session/contract instead of per-provider deals.
//
// Nothing here calls Slotegrator today — there's no API key or
// merchant account wired up. `getGameLaunchSession()` is shaped to
// match what an APIgrator game-launch response looks like (a signed
// iframe URL + session token) so swapping the mock for the real
// call later is a drop-in change, not a UI rewrite.
// ============================================================

const PROVIDERS: CasinoProvider[] = [
  { id: "pragmatic-play", name: "Pragmatic Play", logoUrl: "/casino/providers/pragmatic-play.svg", gameCount: 42 },
  { id: "evolution", name: "Evolution Gaming", logoUrl: "/casino/providers/evolution.svg", gameCount: 18 },
  { id: "netent", name: "NetEnt", logoUrl: "/casino/providers/netent.svg", gameCount: 27 },
  { id: "spribe", name: "Spribe", logoUrl: "/casino/providers/spribe.svg", gameCount: 6 },
  { id: "playtech", name: "Playtech", logoUrl: "/casino/providers/playtech.svg", gameCount: 21 },
  { id: "ezugi", name: "Ezugi", logoUrl: "/casino/providers/ezugi.svg", gameCount: 15 },
]

const GAMES: CasinoGame[] = [
  // Slots
  { id: "slot-001", title: "Gates of Olympus", provider: "Pragmatic Play", category: "slots", thumbnailUrl: "/casino/games/gates-of-olympus.jpg", rating: 4.8, isDemo: true, isNew: true, playersOnline: 1204 },
  { id: "slot-002", title: "Sweet Bonanza", provider: "Pragmatic Play", category: "slots", thumbnailUrl: "/casino/games/sweet-bonanza.jpg", rating: 4.7, isDemo: true, playersOnline: 986 },
  { id: "slot-003", title: "Starburst", provider: "NetEnt", category: "slots", thumbnailUrl: "/casino/games/starburst.jpg", rating: 4.5, isDemo: true, playersOnline: 512 },
  { id: "slot-004", title: "Book of Dead", provider: "Play'n GO", category: "slots", thumbnailUrl: "/casino/games/book-of-dead.jpg", rating: 4.6, isDemo: true, playersOnline: 743 },
  { id: "slot-005", title: "Wolf Gold", provider: "Pragmatic Play", category: "slots", thumbnailUrl: "/casino/games/wolf-gold.jpg", rating: 4.4, isDemo: true, playersOnline: 388 },
  { id: "slot-006", title: "Big Bass Bonanza", provider: "Pragmatic Play", category: "slots", thumbnailUrl: "/casino/games/big-bass-bonanza.jpg", rating: 4.6, isDemo: true, isNew: true, playersOnline: 655 },

  // Crash
  { id: "crash-001", title: "Aviator", provider: "Spribe", category: "crash", thumbnailUrl: "/casino/games/aviator.jpg", rating: 4.9, isDemo: true, playersOnline: 3201 },
  { id: "crash-002", title: "JetX", provider: "SmartSoft", category: "crash", thumbnailUrl: "/casino/games/jetx.jpg", rating: 4.6, isDemo: true, playersOnline: 1120 },
  { id: "crash-003", title: "Mines", provider: "Spribe", category: "crash", thumbnailUrl: "/casino/games/mines.jpg", rating: 4.5, isDemo: true, playersOnline: 890 },

  // Spin & Win
  { id: "spin-001", title: "Spin & Win", provider: "GreenBet Originals", category: "spin-win", thumbnailUrl: "/casino/games/spin-and-win.jpg", rating: 4.7, isDemo: true, isNew: true, playersOnline: 1340 },

  // Roulette
  { id: "roulette-001", title: "Lightning Roulette", provider: "Evolution Gaming", category: "roulette", thumbnailUrl: "/casino/games/lightning-roulette.jpg", rating: 4.8, isDemo: true, playersOnline: 640 },
  { id: "roulette-002", title: "European Roulette", provider: "Playtech", category: "roulette", thumbnailUrl: "/casino/games/european-roulette.jpg", rating: 4.4, isDemo: true, playersOnline: 210 },
  { id: "roulette-003", title: "Auto Roulette", provider: "Evolution Gaming", category: "roulette", thumbnailUrl: "/casino/games/auto-roulette.jpg", rating: 4.3, isDemo: true, playersOnline: 176 },

  // Blackjack
  { id: "blackjack-001", title: "Infinite Blackjack", provider: "Evolution Gaming", category: "blackjack", thumbnailUrl: "/casino/games/infinite-blackjack.jpg", rating: 4.7, isDemo: true, playersOnline: 455 },
  { id: "blackjack-002", title: "Classic Blackjack", provider: "Playtech", category: "blackjack", thumbnailUrl: "/casino/games/classic-blackjack.jpg", rating: 4.3, isDemo: true, playersOnline: 198 },

  // Baccarat
  { id: "baccarat-001", title: "Speed Baccarat", provider: "Evolution Gaming", category: "baccarat", thumbnailUrl: "/casino/games/speed-baccarat.jpg", rating: 4.5, isDemo: true, playersOnline: 302 },
  { id: "baccarat-002", title: "Baccarat Squeeze", provider: "Ezugi", category: "baccarat", thumbnailUrl: "/casino/games/baccarat-squeeze.jpg", rating: 4.4, isDemo: true, playersOnline: 154 },

  // Live Dealer
  { id: "live-001", title: "Crazy Time", provider: "Evolution Gaming", category: "live-dealer", thumbnailUrl: "/casino/games/crazy-time.jpg", rating: 4.9, isDemo: true, playersOnline: 2890 },
  { id: "live-002", title: "Monopoly Live", provider: "Evolution Gaming", category: "live-dealer", thumbnailUrl: "/casino/games/monopoly-live.jpg", rating: 4.8, isDemo: true, playersOnline: 1450 },
  { id: "live-003", title: "Funky Time", provider: "Evolution Gaming", category: "live-dealer", thumbnailUrl: "/casino/games/funky-time.jpg", rating: 4.7, isDemo: true, playersOnline: 980 },

  // Jackpots
  { id: "jackpot-001", title: "Mega Moolah", provider: "Playtech", category: "jackpots", thumbnailUrl: "/casino/games/mega-moolah.jpg", rating: 4.8, isDemo: true, isJackpot: true, jackpotAmount: 48_215_300, playersOnline: 1670 },
  { id: "jackpot-002", title: "Divine Fortune", provider: "NetEnt", category: "jackpots", thumbnailUrl: "/casino/games/divine-fortune.jpg", rating: 4.6, isDemo: true, isJackpot: true, jackpotAmount: 6_320_900, playersOnline: 540 },
  { id: "jackpot-003", title: "Jackpot Giant", provider: "Playtech", category: "jackpots", thumbnailUrl: "/casino/games/jackpot-giant.jpg", rating: 4.4, isDemo: true, isJackpot: true, jackpotAmount: 12_780_450, playersOnline: 310 },
]

// simulated favorites store (in-memory only — replace with Supabase user_favorites table later)
const favoriteIds = new Set<string>(["slot-001", "crash-001", "live-001"])

function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function withFavorite(game: CasinoGame): CasinoGame {
  return { ...game, isFavorite: favoriteIds.has(game.id) }
}

export interface GetCasinoGamesParams {
  category?: CasinoCategory
  provider?: string
  search?: string
  favoritesOnly?: boolean
  sortBy?: "popular" | "rating" | "new"
}

export async function getCasinoGames(
  params: GetCasinoGamesParams = {}
): Promise<CasinoGame[]> {
  let results = GAMES.map(withFavorite)

  if (params.category) {
    results = results.filter((g) => g.category === params.category)
  }
  if (params.provider) {
    results = results.filter((g) => g.provider === params.provider)
  }
  if (params.search) {
    const q = params.search.toLowerCase()
    results = results.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q)
    )
  }
  if (params.favoritesOnly) {
    results = results.filter((g) => g.isFavorite)
  }

  switch (params.sortBy) {
    case "rating":
      results = [...results].sort((a, b) => b.rating - a.rating)
      break
    case "new":
      results = [...results].sort((a, b) => Number(b.isNew) - Number(a.isNew))
      break
    case "popular":
    default:
      results = [...results].sort(
        (a, b) => (b.playersOnline ?? 0) - (a.playersOnline ?? 0)
      )
  }

  return delay(results)
}

export async function getCasinoGameById(
  id: string
): Promise<CasinoGame | null> {
  const game = GAMES.find((g) => g.id === id)
  return delay(game ? withFavorite(game) : null)
}

export async function getFeaturedCasinoGames(
  limit = 8
): Promise<CasinoGame[]> {
  const results = [...GAMES]
    .sort((a, b) => (b.playersOnline ?? 0) - (a.playersOnline ?? 0))
    .slice(0, limit)
    .map(withFavorite)
  return delay(results)
}

export async function getJackpotGames(): Promise<CasinoGame[]> {
  const results = GAMES.filter((g) => g.isJackpot).map(withFavorite)
  return delay(results)
}

export async function getCasinoProviders(): Promise<CasinoProvider[]> {
  return delay(PROVIDERS)
}

export async function getCasinoCategories(): Promise<
  { key: CasinoCategory; label: string; count: number }[]
> {
  const categories: { key: CasinoCategory; label: string }[] = [
    { key: "slots", label: "Slots" },
    { key: "crash", label: "Crash Games" },
    { key: "spin-win", label: "Spin & Win" },
    { key: "roulette", label: "Roulette" },
    { key: "blackjack", label: "Blackjack" },
    { key: "baccarat", label: "Baccarat" },
    { key: "live-dealer", label: "Live Dealers" },
    { key: "jackpots", label: "Jackpots" },
  ]
  const withCounts = categories.map((c) => ({
    ...c,
    count: GAMES.filter((g) => g.category === c.key).length,
  }))
  return delay(withCounts)
}

export async function toggleFavoriteGame(gameId: string): Promise<boolean> {
  if (favoriteIds.has(gameId)) {
    favoriteIds.delete(gameId)
  } else {
    favoriteIds.add(gameId)
  }
  return delay(favoriteIds.has(gameId), 200)
}

export interface GameLaunchSession {
  gameId: string
  mode: "demo"
  sessionToken: string | null
  launchUrl: string | null
  provider: string
  expiresAt: string
}

// Stubbed for future Slotegrator APIgrator integration.
// A real call to APIgrator's game-launch endpoint returns a signed
// iframe URL + session token scoped to a player/currency/mode. This
// mock mirrors that same shape (minus real credentials) so the
// "Play Demo" button and game-launch modal don't need to change
// when the actual API call replaces this function body.
export async function getGameLaunchSession(
  gameId: string
): Promise<GameLaunchSession> {
  const game = GAMES.find((g) => g.id === gameId)
  return delay(
    {
      gameId,
      mode: "demo",
      sessionToken: null,
      launchUrl: null,
      provider: game?.provider ?? "unknown",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    },
    300
  )
}
