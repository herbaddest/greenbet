"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Wallet,
  Search,
  Bell,
  User,
  Trophy,
  Coins,
  ArrowDownCircle,
  LogOut,
} from "lucide-react"
import { useBetSlip } from "@/contexts/BetSlipContext"

export default function Dashboard() {
  const router = useRouter()
  const { addSelection } = useBetSlip()

  const [email, setEmail] = useState("")
  const [balance] = useState(0)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setEmail(user.email ?? "")
    }

    loadUser()
  }, [router])


  async function logout() {
    await supabase.auth.signOut()
    router.push("/")
  }
  const [liveMatches, setLiveMatches] = useState<any[]>([])

useEffect(() => {
  async function loadLiveMatches() {
    try {
      const res = await fetch("/api/sports/fixtures?status=live")
      const data = await res.json()
      setLiveMatches(data.matches || [])
    } catch (err) {
      console.error(err)
    }
  }

  loadLiveMatches()
}, [])

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">

          <div className="flex items-center gap-10">

            <h1 className="text-3xl font-black text-emerald-500">
              GreenBet
            </h1>

            <nav className="hidden lg:flex gap-6">

              <button className="text-emerald-400 font-semibold">
                Sports
              </button>

              <button>Live</button>

              <button>Casino</button>

              <button>Aviator</button>

              <button>Spin & Win</button>

              <button>Results</button>

            </nav>

          </div>

          <div className="hidden md:flex items-center gap-4">

            <div className="flex items-center rounded-lg bg-zinc-900 px-4 py-2">

              <Search size={18} />

              <input
                placeholder="Search..."
                className="ml-2 bg-transparent outline-none"
              />

            </div>

            <button className="rounded-lg bg-emerald-500 px-5 py-2 font-bold text-black">

              Deposit

            </button>

            <Bell />

            <User />

            <button
              onClick={logout}
              className="rounded-lg border border-red-500 p-2"
            >
              <LogOut size={18} />
            </button>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">

        <h2 className="text-3xl font-bold">
          Welcome Back
        </h2>

        <p className="mt-2 text-zinc-400">
          {email}
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">

          {/* LEFT SIDE */}

          <div>

            {/* WALLET */}

            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 p-8">

              <div className="flex items-center gap-4">

                <Wallet size={36} />

                <div>

                  <p>Wallet Balance</p>

                  <h2 className="text-5xl font-bold">

                    KSh {balance.toFixed(2)}

                  </h2>

                </div>

              </div>

            </div>
                        {/* LIVE MATCHES */}

            <section className="mt-8">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  🔴 Live Matches
                </h2>

                <button className="text-emerald-400">
                  View All →
                </button>

              </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {liveMatches.map((match) => {
                const matchLabel = `${match.homeTeam?.name ?? "Home"} vs ${match.awayTeam?.name ?? "Away"}`

                return (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-emerald-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="animate-pulse font-semibold text-red-500">
                        LIVE • {match.minute ?? 0}'
                      </span>

                      <span className="text-sm text-zinc-500">{match.league}</span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold">
                      {match.homeTeam?.name ?? "Home"}
                      <span className="mx-3 text-zinc-500">vs</span>
                      {match.awayTeam?.name ?? "Away"}
                    </h3>

                    <p className="mt-2 text-zinc-400">
                      Score: {match.homeScore ?? 0} - {match.awayScore ?? 0}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        onClick={() =>
                          addSelection({
                            id: `${match.id}-home`,
                            matchLabel,
                            selectionLabel: "Home",
                            odds: 2.15,
                          })
                        }
                        className="rounded-lg bg-zinc-800 py-3 hover:bg-emerald-600"
                      >
                        Home
                        <br />
                        <span className="font-bold">2.15</span>
                      </button>

                      <button
                        onClick={() =>
                          addSelection({
                            id: `${match.id}-draw`,
                            matchLabel,
                            selectionLabel: "Draw",
                            odds: 3.45,
                          })
                        }
                        className="rounded-lg bg-zinc-800 py-3 hover:bg-emerald-600"
                      >
                        Draw
                        <br />
                        <span className="font-bold">3.45</span>
                      </button>

                      <button
                        onClick={() =>
                          addSelection({
                            id: `${match.id}-away`,
                            matchLabel,
                            selectionLabel: "Away",
                            odds: 2.9,
                          })
                        }
                        className="rounded-lg bg-zinc-800 py-3 hover:bg-emerald-600"
                      >
                        Away
                        <br />
                        <span className="font-bold">2.90</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            </section>

            {/* UPCOMING MATCHES */}

            <section className="mt-10">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  📅 Upcoming Matches
                </h2>

                <button className="text-emerald-400">
                  View All →
                </button>

              </div>

              <div className="space-y-4">

                {[
                  "Manchester United vs Tottenham",
                  "PSG vs Marseille",
                  "Juventus vs Inter Milan",
                  "Napoli vs AC Milan",
                ].map((game) => (

                  <div
                    key={game}
                    className="flex items-center justify-between rounded-xl bg-zinc-900 p-5"
                  >

                    <div>

                      <h3 className="font-bold">
                        {game}
                      </h3>

                      <p className="text-sm text-zinc-500">
                        Tomorrow • 20:00
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <button className="rounded bg-zinc-800 px-4 py-2 hover:bg-emerald-600">
                        2.20
                      </button>

                      <button className="rounded bg-zinc-800 px-4 py-2 hover:bg-emerald-600">
                        3.20
                      </button>

                      <button className="rounded bg-zinc-800 px-4 py-2 hover:bg-emerald-600">
                        2.85
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </section>
                        {/* CASINO */}

            <section className="mt-10">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                  🎰 Popular Casino
                </h2>

                <button className="text-emerald-400">
                  View All →
                </button>

              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                {[
                  {
                    title: "Aviator",
                    color: "bg-emerald-600",
                  },
                  {
                    title: "Spin & Win",
                    color: "bg-yellow-500",
                  },
                  {
                    title: "Blackjack",
                    color: "bg-zinc-800",
                  },
                  {
                    title: "Roulette",
                    color: "bg-zinc-800",
                  },
                ].map((game) => (

                  <div
                    key={game.title}
                    className="rounded-2xl bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border hover:border-emerald-500"
                  >

                    <div
                      className={`mb-5 flex h-20 items-center justify-center rounded-xl ${game.color}`}
                    >

                      <Coins size={40} />

                    </div>

                    <h3 className="text-xl font-bold">
                      {game.title}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Popular casino game
                    </p>

                    <button className="mt-6 w-full rounded-lg bg-emerald-500 py-3 font-bold text-black">
                      Play
                    </button>

                  </div>

                ))}

              </div>

            </section>

            {/* PROMOTIONS */}

            <section className="mt-10">

              <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-green-500 p-8">

                <Trophy size={40} />

                <h2 className="mt-4 text-3xl font-bold">
                  KSh 15,000,000 Jackpot
                </h2>

                <p className="mt-2">
                  Predict 17 matches correctly and win today's jackpot.
                </p>

                <button className="mt-6 rounded-lg bg-black px-6 py-3 font-bold">
                  Play Jackpot
                </button>

              </div>

            </section>

            {/* RECENT BETS */}

            <section className="mt-10 rounded-2xl bg-zinc-900 p-6">

              <h2 className="text-2xl font-bold">
                Recent Bets
              </h2>

              <div className="mt-6 rounded-xl border border-dashed border-zinc-700 p-10 text-center">

                <p className="text-zinc-500">
                  No bets placed yet.
                </p>

              </div>

            </section>

          </div>

          {/* BET SLIP */}

          <aside>

            <div className="sticky top-24 rounded-2xl bg-zinc-900 p-6">

              <h2 className="text-2xl font-bold">
                Bet Slip
              </h2>

              <p className="mt-6 text-zinc-500">
                No selections yet.
              </p>

              <div className="mt-8">

                <label className="text-sm text-zinc-400">
                  Stake
                </label>

                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-2 w-full rounded-lg bg-zinc-800 p-3 outline-none"
                />

              </div>

              <div className="mt-6 flex justify-between">

                <span>Total Odds</span>

                <span className="font-bold">
                  0.00
                </span>

              </div>

              <button className="mt-8 w-full rounded-lg bg-emerald-500 py-3 font-bold text-black">

                Place Bet

              </button>

              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500 py-3">

                <ArrowDownCircle size={18} />

                Deposit

              </button>

            </div>

          </aside>

        </div>

      </div>

    </main>

  )
}