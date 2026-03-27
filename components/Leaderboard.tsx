"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";

interface LeaderboardProps {
  onClose: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const { entries, loading, error } = useLeaderboard(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-black border border-[#8b1a4a] rounded-2xl shadow-[0_0_30px_rgba(139,26,74,0.4)] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#8b1a4a]/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-lg font-bold text-gray-100">Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="text-center text-gray-500 py-8 text-sm">Loading…</p>
          )}
          {error && (
            <p className="text-center text-red-400 py-8 text-sm">{error}</p>
          )}
          {!loading && !error && entries.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">
              No players yet 👀
            </p>
          )}

          {entries.map((entry, idx) => {
            const pct =
              entry.total === 0
                ? 0
                : Math.round((entry.completed / entry.total) * 100);

            return (
              <div
                key={entry.id}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                  ${
                    idx === 0
                      ? "border-yellow-600/50 bg-yellow-950/20"
                      : "border-[#8b1a4a]/30 bg-[#0a0005]/40"
                  }
                `}
              >
                <span className="text-xl w-7 text-center flex-shrink-0">
                  {MEDALS[idx] ?? `${idx + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">
                    {entry.name}
                  </p>
                  {/* mini progress bar */}
                  <div className="mt-1 h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg,#8b1a4a,#c2185b)",
                      }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-100">
                    {entry.completed}
                    <span className="text-gray-500 font-normal text-xs">
                      /{entry.total}
                    </span>
                  </p>
                  <p className="text-xs text-[#c2185b]">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-4 pt-1">
          <p className="text-xs text-gray-600 text-center">
            Updates every 7 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
