"use client";

import { useState, useCallback } from "react";
import { usePolling } from "./usePolling";
import type { LeaderboardEntry } from "@/lib/types";

export function useLeaderboard(enabled = true) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data: LeaderboardEntry[] = await res.json();
      setEntries(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetch, 7_000, enabled);

  return { entries, loading, error, refetch: fetch };
}
