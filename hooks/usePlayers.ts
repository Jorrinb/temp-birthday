"use client";

import { useState, useCallback } from "react";
import { usePolling } from "./usePolling";
import type { Player } from "@/lib/types";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch("/api/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      const data: Player[] = await res.json();
      setPlayers(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetch, 10_000);

  return { players, loading, error, refetch: fetch };
}
