"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Heart, Users, Clock } from "lucide-react"
import type { CasinoGame } from "@/types"

// ============================================================
// GAME CARD
// Every game — playable or not — is presented identically: real
// thumbnail, provider, rating, live player count. There is no
// visible "demo" labeling on the card itself, so the lobby reads
// as a complete, live game catalogue.
//
// Behavior on click differs by title:
// - Aviator / Spin & Win (isPlayable=true): calls onPlay(game),
//   parent opens the actual working game component.
// - Everything else: shows a brief "Coming Soon" overlay in place,
//   without navigating anywhere or claiming to launch a demo.
// ============================================================

interface GameCardProps {
  game: CasinoGame
  isPlayable?: boolean
  onPlay?: (game: CasinoGame) => void
  onToggleFavorite?: (gameId: string) => void
}

export default function GameCard({
  game,
  isPlayable = false,
  onPlay,
  onToggleFavorite,
}: GameCardProps) {
  const [showComingSoon, setShowComingSoon] = useState(false)

  function handlePlayClick() {
    if (isPlayable) {
      onPlay?.(game)
      return
    }
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 1800)
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] transition-colors hover:border-primary/40">
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5">
        <Image
          src={game.thumbnailUrl}
          alt={game.title}
          fill
          sizes="(max-width: 768px) 45vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            {game.isNew && (
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                NEW
              </span>
            )}
            {game.isJackpot && (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-secondary-foreground">
                JACKPOT
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite?.(game.id)
            }}
            className="rounded-full bg-black/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                game.isFavorite ? "fill-live text-live" : "text-white"
              }`}
            />
          </button>
        </div>

        {/* Jackpot ticker */}
        {game.isJackpot && game.jackpotAmount && (
          <div className="absolute bottom-14 left-2 right-2 rounded-md bg-black/60 px-2 py-1 text-center backdrop-blur-sm">
            <p className="text-[10px] text-gold-300 font-bold tabular-nums">
              KES {game.jackpotAmount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Hover / tap overlay with Play button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100">
          <button
            onClick={handlePlayClick}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
          >
            Play
          </button>
        </div>

        {/* Coming soon overlay */}
        <AnimatePresence>
          {showComingSoon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/80 backdrop-blur-sm"
            >
              <Clock className="h-5 w-5 text-secondary" />
              <p className="text-sm font-bold text-white">Coming Soon</p>
              <p className="text-[11px] text-muted-foreground px-4 text-center">
                This game is being added to the lobby
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info footer */}
      <div className="p-2.5 space-y-1">
        <p className="truncate text-sm font-semibold">{game.title}</p>
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-muted-foreground">{game.provider}</p>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3 w-3 fill-secondary text-secondary" />
            <span className="text-xs text-muted-foreground">{game.rating.toFixed(1)}</span>
          </div>
        </div>
        {typeof game.playersOnline === "number" && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{game.playersOnline.toLocaleString()} playing</span>
          </div>
        )}
      </div>
    </div>
  )
}
