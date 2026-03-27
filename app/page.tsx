"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayers } from "@/hooks/usePlayers";
import PlayerCard from "@/components/PlayerCard";
import AddPlayerModal from "@/components/AddPlayerModal";
import ManagementPanel from "@/components/ManagementPanel";
import Leaderboard from "@/components/Leaderboard";
import type { Player } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { players, loading, error, refetch } = usePlayers();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastPlayerId, setLastPlayerId] = useState<number | null>(null);
  const [lastPlayerName, setLastPlayerName] = useState<string | null>(null);

  // Read last selected player from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("lastPlayerId");
    const storedName = localStorage.getItem("lastPlayerName");
    if (stored) {
      setLastPlayerId(Number(stored));
      setLastPlayerName(storedName);
    }
  }, []);

  function handleSelectPlayer(player: Player) {
    localStorage.setItem("lastPlayerId", String(player.id));
    localStorage.setItem("lastPlayerName", player.name);
    router.push(`/player/${player.id}`);
  }

  async function handleAddPlayer(name: string) {
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to add player");
    }
    const newPlayer: Player = await res.json();
    await refetch();
    handleSelectPlayer(newPlayer);
  }

  // Check if last player still exists in the current list
  const lastPlayerStillExists =
    lastPlayerId != null && players.some((p) => p.id === lastPlayerId);

  return (
    <main className="min-h-dvh flex flex-col items-center px-4 py-8 safe-bottom">
      {/* Header area */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-start justify-between">
          {/* Title block */}
          <div>
            <p className="text-[#c2185b] text-xs uppercase tracking-[0.25em] font-semibold mb-1">
              🎂 Maria's Birthday
            </p>
            <h1 className="text-2xl font-bold text-gray-100 leading-tight">
              Choose Your Character
            </h1>
          </div>

          {/* Top-right buttons */}
          <div className="flex items-center gap-2 mt-1">
            {/* Leaderboard */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="
                w-9 h-9 flex items-center justify-center rounded-xl
                border border-[#8b1a4a]/60 bg-black text-lg
                hover:border-[#c2185b] hover:shadow-[0_0_10px_rgba(194,24,91,0.3)]
                transition-all
              "
              aria-label="Leaderboard"
              title="Leaderboard"
            >
              🏆
            </button>

            {/* Gear / Management */}
            <button
              onClick={() => setShowManagement(true)}
              className="
                w-9 h-9 flex items-center justify-center rounded-xl
                border border-[#8b1a4a]/60 bg-black text-lg
                hover:border-[#c2185b] hover:shadow-[0_0_10px_rgba(194,24,91,0.3)]
                transition-all
              "
              aria-label="Management panel"
              title="Party Control Panel"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-gray-500 text-sm mt-2">
          Pick your player and complete tonight's bucket list 🌙
        </p>
      </div>

      {/* Player list card */}
      <div className="w-full max-w-sm bg-black border border-[#8b1a4a] rounded-2xl shadow-[0_0_20px_rgba(139,26,74,0.25)] overflow-hidden">
        {/* Continue as last player */}
        {lastPlayerStillExists && lastPlayerName && (
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() =>
                handleSelectPlayer({ id: lastPlayerId!, name: lastPlayerName, created_at: "" })
              }
              className="
                w-full flex items-center gap-2 px-3 py-2 rounded-xl
                bg-[#8b1a4a]/10 border border-[#8b1a4a]/40 text-sm text-gray-300
                hover:bg-[#8b1a4a]/20 hover:border-[#c2185b]/60 transition-all
              "
            >
              <span className="text-base">↩</span>
              <span>Continue as <span className="font-semibold text-gray-100">{lastPlayerName}</span></span>
            </button>
            <div className="mt-3 mb-1 px-1">
              <p className="text-xs text-gray-600 uppercase tracking-widest">All Players</p>
            </div>
          </div>
        )}

        {/* Loading / error / empty states */}
        {loading && (
          <div className="px-4 py-10 text-center text-gray-500 text-sm">Loading players…</div>
        )}
        {!loading && error && (
          <div className="px-4 py-6 text-center text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && players.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-gray-400 text-sm">No players yet — be the first!</p>
          </div>
        )}

        {/* Player cards */}
        {!loading && !error && players.length > 0 && (
          <div className="px-3 py-3 space-y-2">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={handleSelectPlayer} />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 border-t border-[#8b1a4a]/20" />

        {/* Add a Character button */}
        <div className="px-3 py-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="
              w-full py-3 rounded-xl text-sm font-semibold text-gray-300
              border border-dashed border-[#8b1a4a]/60
              hover:border-[#c2185b] hover:text-white hover:bg-[#0d0005]
              hover:shadow-[0_0_12px_rgba(194,24,91,0.2)]
              transition-all duration-200
            "
          >
            + Add a Character
          </button>
        </div>
      </div>

      {/* Polling note */}
      <p className="text-gray-700 text-xs mt-6 text-center">
        Player list refreshes every 10 seconds
      </p>

      {/* Modals */}
      {showAddModal && (
        <AddPlayerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPlayer}
        />
      )}
      {showManagement && (
        <ManagementPanel
          onClose={() => setShowManagement(false)}
          onPlayersChanged={refetch}
        />
      )}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </main>
  );
}
