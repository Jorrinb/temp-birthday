"use client";

import type { Player } from "@/lib/types";

// Simple deterministic emoji set for players
const EMOJIS = ["🌟", "🦋", "🌙", "🔥", "💫", "🎀", "👑", "🦄", "💎", "🌸"];

function getEmoji(id: number): string {
  return EMOJIS[id % EMOJIS.length];
}

interface PlayerCardProps {
  player: Player;
  onClick: (player: Player) => void;
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={() => onClick(player)}
      className="
        group w-full flex items-center gap-3 px-4 py-3
        bg-black border border-[#8b1a4a] rounded-2xl
        shadow-[0_0_12px_rgba(139,26,74,0.2)]
        hover:border-[#c2185b] hover:shadow-[0_0_20px_rgba(194,24,91,0.4)]
        hover:bg-[#0d0005]
        active:scale-[0.98]
        transition-all duration-200 text-left
      "
    >
      <span className="text-2xl select-none">{getEmoji(player.id)}</span>
      <span className="text-gray-100 font-semibold text-base group-hover:text-white transition-colors">
        {player.name}
      </span>
      <span className="ml-auto text-[#8b1a4a] group-hover:text-[#c2185b] transition-colors text-lg">›</span>
    </button>
  );
}
