"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useChecklist } from "@/hooks/useChecklist";
import ChecklistItem from "@/components/ChecklistItem";
import ProgressBar from "@/components/ProgressBar";
import Leaderboard from "@/components/Leaderboard";
import type { Player, ChecklistEntry } from "@/lib/types";

// Category display order + labels
const CATEGORY_ORDER = ["Club", "Karaoke", "Core Memory", "Funny"];
const CATEGORY_EMOJI: Record<string, string> = {
  Club: "🎉",
  Karaoke: "🎤",
  "Core Memory": "📸",
  Funny: "😂",
};

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playerId = Number(id);
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerError, setPlayerError] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { items, loading, optimisticToggle, refetch } = useChecklist(playerId);

  // Fetch player info once
  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((players: Player[]) => {
        const found = players.find((p) => p.id === playerId);
        if (found) {
          setPlayer(found);
          // Keep localStorage in sync
          localStorage.setItem("lastPlayerId", String(found.id));
          localStorage.setItem("lastPlayerName", found.name);
        } else {
          setPlayerError(true);
        }
      })
      .catch(() => setPlayerError(true));
  }, [playerId]);

  async function handleToggle(activityId: number) {
    if (togglingId === activityId) return;
    setTogglingId(activityId);
    optimisticToggle(activityId);
    try {
      await fetch(`/api/players/${playerId}/checklist/${activityId}/toggle`, {
        method: "POST",
      });
      // Refetch to confirm server state
      await refetch();
    } catch {
      // If toggle fails, refetch to correct optimistic state
      await refetch();
    } finally {
      setTogglingId(null);
    }
  }

  // Group items by category in the defined order
  function groupByCategory(items: ChecklistEntry[]): [string, ChecklistEntry[]][] {
    const grouped: Record<string, ChecklistEntry[]> = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    const ordered: [string, ChecklistEntry[]][] = [];
    // First render categories in the defined order
    for (const cat of CATEGORY_ORDER) {
      if (grouped[cat]?.length) ordered.push([cat, grouped[cat]]);
    }
    // Then any extra categories not in the predefined order
    for (const cat of Object.keys(grouped)) {
      if (!CATEGORY_ORDER.includes(cat)) ordered.push([cat, grouped[cat]]);
    }
    return ordered;
  }

  const grouped = groupByCategory(items);
  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;

  if (playerError) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="bg-black border border-[#8b1a4a] rounded-2xl p-8 text-center max-w-xs">
          <p className="text-3xl mb-3">👻</p>
          <p className="text-gray-300 font-semibold mb-2">Player not found</p>
          <p className="text-gray-500 text-sm mb-5">This player may have been removed.</p>
          <button
            onClick={() => router.push("/")}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#8b1a4a] hover:bg-[#c2185b] transition-all"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center px-4 py-8 safe-bottom">
      <div className="w-full max-w-sm space-y-5">
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <button
            onClick={() => router.push("/")}
            className="
              flex items-center gap-1.5 text-sm text-gray-400
              hover:text-gray-200 transition-colors
            "
          >
            ← Back
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="
              w-9 h-9 flex items-center justify-center rounded-xl
              border border-[#8b1a4a]/60 bg-black text-lg
              hover:border-[#c2185b] hover:shadow-[0_0_10px_rgba(194,24,91,0.3)]
              transition-all
            "
            aria-label="Leaderboard"
          >
            🏆
          </button>
        </div>

        {/* Player header card */}
        <div className="bg-black border border-[#8b1a4a] rounded-2xl shadow-[0_0_20px_rgba(139,26,74,0.25)] px-5 py-5 space-y-4">
          <div>
            <p className="text-[#c2185b] text-xs uppercase tracking-[0.2em] font-semibold mb-0.5">
              Tonight's Mission
            </p>
            <h1 className="text-xl font-bold text-gray-100">
              {player ? player.name : <span className="text-gray-600 animate-pulse">Loading…</span>}
            </h1>
          </div>

          {!loading && totalCount > 0 && (
            <ProgressBar completed={completedCount} total={totalCount} />
          )}

          {completedCount === totalCount && totalCount > 0 && (
            <div className="text-center py-2">
              <p className="text-[#c2185b] text-sm font-semibold animate-pulse">
                🎉 You crushed the bucket list! Legend.
              </p>
            </div>
          )}
        </div>

        {/* Checklist grouped by category */}
        {loading && (
          <div className="bg-black border border-[#8b1a4a]/40 rounded-2xl px-5 py-10 text-center text-gray-500 text-sm">
            Loading checklist…
          </div>
        )}

        {!loading && totalCount === 0 && (
          <div className="bg-black border border-[#8b1a4a]/40 rounded-2xl px-5 py-10 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-400 text-sm">No activities yet — check back soon!</p>
          </div>
        )}

        {!loading &&
          grouped.map(([category, categoryItems]) => (
            <div key={category} className="bg-black border border-[#8b1a4a] rounded-2xl shadow-[0_0_12px_rgba(139,26,74,0.15)] overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#8b1a4a]/20">
                <span className="text-base">{CATEGORY_EMOJI[category] ?? "📌"}</span>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {category}
                </h2>
                <span className="ml-auto text-xs text-gray-600">
                  {categoryItems.filter((i) => i.is_completed).length}/{categoryItems.length}
                </span>
              </div>

              {/* Items */}
              <div className="px-3 py-2.5 space-y-2">
                {categoryItems.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    disabled={togglingId === item.id}
                  />
                ))}
              </div>
            </div>
          ))}

        {/* Polling note */}
        <p className="text-gray-700 text-xs text-center pb-4">
          Checklist refreshes every 4 seconds
        </p>
      </div>

      {/* Leaderboard modal */}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </main>
  );
}
