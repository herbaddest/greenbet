import {
  Activity,
  CircleDot, // basketball

  Gamepad2,
  Globe,
  Shield,
  Trophy,
  Volleyball,
  Zap,
  Clock,
  Headphones,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { label: string; href: string; live?: boolean }

export const navItems: NavItem[] = [
  { label: 'Sports', href: '/#sports' },
  { label: 'Live', href: '/#live', live: true },
  { label: 'Aviator', href: '/aviator' },
  { label: 'Veta', href: '/veta' },
  { label: 'Spin & Win', href: '/spin' },
  { label: 'Promotions', href: '/promotions' },
  { label: 'Results', href: '#results' },
]

export type Sport = { name: string; icon: LucideIcon; events: number }

export const sports: Sport[] = [
  { name: 'Football', icon: Volleyball, events: 1284 },
  { name: 'Basketball', icon: CircleDot, events: 342 },
  { name: 'Tennis', icon: Activity, events: 198 },
  { name: 'Rugby', icon: Trophy, events: 74 },
  { name: 'eSports', icon: Gamepad2, events: 156 },
  { name: 'Virtual Sports', icon: Globe, events: 512 },
]

export type Match = {
  id: string
  league: string
  home: string
  away: string
  kickoff: string
  isLive?: boolean
  minute?: string
  odds: { home: number; draw: number; away: number }
}

export const liveMatches: Match[] = [
  {
    id: 'm1',
    league: 'FKF Premier League',
    home: 'Gor Mahia',
    away: 'AFC Leopards',
    kickoff: 'Today 18:00',
    isLive: true,
    minute: "63'",
    odds: { home: 1.85, draw: 3.2, away: 4.1 },
  },
  {
    id: 'm2',
    league: 'Premier League',
    home: 'Arsenal',
    away: 'Man City',
    kickoff: 'Today 20:30',
    isLive: true,
    minute: "27'",
    odds: { home: 2.4, draw: 3.5, away: 2.75 },
  },
  {
    id: 'm3',
    league: 'La Liga',
    home: 'Real Madrid',
    away: 'Sevilla',
    kickoff: 'Today 22:00',
    odds: { home: 1.55, draw: 4.0, away: 5.5 },
  },
  {
    id: 'm4',
    league: 'Serie A',
    home: 'Inter',
    away: 'Juventus',
    kickoff: 'Tomorrow 19:45',
    odds: { home: 2.1, draw: 3.1, away: 3.6 },
  },
  {
    id: 'm5',
    league: 'Bundesliga',
    home: 'Bayern',
    away: 'Dortmund',
    kickoff: 'Tomorrow 17:30',
    isLive: true,
    minute: "80'",
    odds: { home: 1.7, draw: 4.2, away: 4.5 },
  },
  {
    id: 'm6',
    league: 'Ligue 1',
    home: 'PSG',
    away: 'Marseille',
    kickoff: 'Sun 21:00',
    odds: { home: 1.4, draw: 4.8, away: 6.5 },
  },
]

export const oddsTicker = [
  'Gor Mahia vs AFC Leopards • 1.85',
  'Arsenal vs Man City • 2.40',
  'Real Madrid vs Sevilla • 1.55',
  'Inter vs Juventus • 2.10',
  'Bayern vs Dortmund • 1.70',
  'PSG vs Marseille • 1.40',
  'Man Utd vs Liverpool • 3.10',
  'Barcelona vs Atletico • 1.95',
  'Chelsea vs Spurs • 2.25',
]

export type PopularBet = {
  match: string
  market: string
  pick: string
  odds: number
  stakedBy: string
}

export const popularBets: PopularBet[] = [
  {
    match: 'Arsenal vs Man City',
    market: 'Both Teams to Score',
    pick: 'Yes',
    odds: 1.72,
    stakedBy: '12.4k',
  },
  {
    match: 'Real Madrid vs Sevilla',
    market: 'Match Result',
    pick: 'Real Madrid',
    odds: 1.55,
    stakedBy: '9.8k',
  },
  {
    match: 'Gor Mahia vs AFC Leopards',
    market: 'Over/Under 2.5',
    pick: 'Over 2.5',
    odds: 2.05,
    stakedBy: '7.1k',
  },
  {
    match: 'PSG vs Marseille',
    market: 'Correct Score',
    pick: '2 - 0',
    odds: 6.5,
    stakedBy: '5.6k',
  },
]

export type VetaTicket = {
  id: string
  title: string
  matches: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  jackpot: string
  closesIn: string
}

export const vetaTickets: VetaTicket[] = [
  {
    id: 'v1',
    title: 'Daily Midweek Veta',
    matches: 13,
    difficulty: 'Medium',
    jackpot: 'KSh 15,000,000',
    closesIn: '4h 12m',
  },
  {
    id: 'v2',
    title: 'Weekend Mega Veta',
    matches: 17,
    difficulty: 'Hard',
    jackpot: 'KSh 100,000,000',
    closesIn: '2d 6h',
  },
  {
    id: 'v3',
    title: 'Rookie Veta',
    matches: 8,
    difficulty: 'Easy',
    jackpot: 'KSh 2,500,000',
    closesIn: '6h 40m',
  },
]

export type Promotion = {
  tag: string
  title: string
  description: string
  cta: string
}

export const promotions: Promotion[] = [
  {
    tag: 'New Players',
    title: '100% Welcome Bonus',
    description: 'Double your first deposit up to KSh 10,000 and start winning big.',
    cta: 'Claim Bonus',
  },
  {
    tag: 'Accumulator',
    title: 'Multibet Boost +45%',
    description: 'Add 5+ legs to your bet slip and boost your winnings automatically.',
    cta: 'Build Multibet',
  },
  {
    tag: 'Free Bet',
    title: 'Refer & Earn KSh 500',
    description: 'Invite friends with your code and earn a free bet on their first stake.',
    cta: 'Invite Friends',
  },
]

export type Feature = { title: string; description: string; icon: LucideIcon }

export const features: Feature[] = [
  {
    title: 'Fast Payouts',
    description: 'Instant M-Pesa withdrawals processed in under 60 seconds, 24/7.',
    icon: Wallet,
  },
  {
    title: 'Secure Platform',
    description: 'Bank-grade encryption and licensed operations keep your money safe.',
    icon: Shield,
  },
  {
    title: '24/7 Support',
    description: 'Real humans on WhatsApp, call and chat whenever you need us.',
    icon: Headphones,
  },
  {
    title: 'Mobile Friendly',
    description: 'A lightning-fast experience on any phone, even on low data.',
    icon: Smartphone,
  },
]

export const trustHighlights = [
  { icon: Zap, label: 'Instant M-Pesa' },
  { icon: Clock, label: '60s Payouts' },
  { icon: Shield, label: 'Licensed & Secure' },
]
