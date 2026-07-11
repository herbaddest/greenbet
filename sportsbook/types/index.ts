// ============================================================
// GREENBET — Shared domain types
// These types are the contract between mock /services and the UI.
// When real backends (Supabase, Sports API, Casino provider) are
// wired in, only the services need to change — components consume
// these same shapes regardless of data source.
// ============================================================

// ---------- Sportsbook ----------

export type SportKey =
  | "football"
  | "basketball"
  | "tennis"
  | "esports"
  | "rugby"
  | "cricket"
  | "boxing"

export type MatchStatus = "upcoming" | "live" | "finished"

export interface Team {
  id: string
  name: string
  shortName: string
  logoUrl: string
}

export interface OddsMarketSelection {
  id: string
  label: string // e.g. "1", "X", "2", "Over 2.5"
  price: number // decimal odds, e.g. 1.85
}

export interface OddsMarket {
  id: string
  name: string // e.g. "Match Winner", "Total Goals"
  selections: OddsMarketSelection[]
}

export interface Match {
  id: string
  sport: SportKey
  league: string
  leagueLogoUrl?: string
  homeTeam: Team
  awayTeam: Team
  startTime: string // ISO 8601
  status: MatchStatus
  minute?: number // live matches only
  homeScore?: number
  awayScore?: number
  isPopular: boolean
  markets: OddsMarket[]
}

export interface League {
  id: string
  name: string
  sport: SportKey
  country: string
  logoUrl: string
  matchCount: number
}

// ---------- Bet Slip ----------

export type BetSlipMode = "single" | "multiple" | "system"

export interface BetSlipSelection {
  id: string // unique per selection, usually `${matchId}-${marketId}-${selectionId}`
  matchId: string
  matchLabel: string // "Arsenal vs Chelsea"
  marketName: string // "Match Winner"
  selectionLabel: string // "Arsenal"
  odds: number
  isLive: boolean
  isSuspended?: boolean
}

export interface PlacedBet {
  id: string
  placedAt: string
  mode: BetSlipMode
  stake: number
  totalOdds: number
  potentialReturn: number
  selections: BetSlipSelection[]
  status: "open" | "won" | "lost" | "void" | "cashed_out"
  settledAt?: string
}

// ---------- Casino ----------

export type CasinoCategory =
  | "slots"
  | "crash"
  | "spin-win"
  | "roulette"
  | "blackjack"
  | "baccarat"
  | "live-dealer"
  | "jackpots"

export interface CasinoGame {
  id: string
  title: string
  provider: string
  category: CasinoCategory
  thumbnailUrl: string
  rating: number // 0-5
  isDemo: boolean
  isJackpot?: boolean
  jackpotAmount?: number
  isNew?: boolean
  isFavorite?: boolean
  playersOnline?: number
}

export interface CasinoProvider {
  id: string
  name: string
  logoUrl: string
  gameCount: number
}

// ---------- Wallet ----------

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bet_placed"
  | "bet_won"
  | "bet_refund"
  | "bonus_credit"
  | "bonus_expired"

export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  method?: string // "M-Pesa", "Card", "Bank Transfer"
  createdAt: string
  reference: string
  description: string
}

export interface WalletBalance {
  main: number
  bonus: number
  locked: number
  totalWinnings: number
  currency: "KES"
}

// ---------- User / Profile ----------

export type KycStatus = "unverified" | "pending" | "verified" | "rejected"

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl?: string
  kycStatus: KycStatus
  vipTier: "bronze" | "silver" | "gold" | "platinum"
  vipPoints: number
  joinedAt: string
  responsibleGaming: {
    depositLimit?: number
    lossLimit?: number
    sessionTimeLimitMinutes?: number
    selfExcludedUntil?: string
  }
}

// ---------- Notifications ----------

export type NotificationType =
  | "bet_settled"
  | "promotion"
  | "deposit_confirmed"
  | "withdrawal_processed"
  | "system"
  | "vip_upgrade"

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

// ---------- Promotions ----------

export interface Promotion {
  id: string
  title: string
  description: string
  imageUrl: string
  category: "sportsbook" | "casino" | "welcome" | "reload" | "vip"
  expiresAt?: string
  termsUrl?: string
}

// ---------- Shared UI helper types ----------

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T }
