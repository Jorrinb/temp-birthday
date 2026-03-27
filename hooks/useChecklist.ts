"use client";

import { useState, useCallback } from "react";
import { usePolling } from "./usePolling";
import type { ChecklistEntry } from "@/lib/types";

export function useChecklist(playerId: number | null) {
  const [items, setItems] = useState<ChecklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!playerId) return;
    try {
      const res = await window.fetch(`/api/players/${playerId}/checklist`);
      if (!res.ok) throw new Error("Failed to fetch checklist");
      const data: ChecklistEntry[] = await res.json();
      setItems(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  usePolling(fetch, 4_000, !!playerId);

  // Optimistically toggle an item in local state before the next poll confirms
  const optimisticToggle = useCallback((activityId: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === activityId
          ? {
              ...item,
              is_completed: !item.is_completed,
              completed_at: !item.is_completed ? new Date().toISOString() : null,
            }
          : item
      )
    );
  }, []);

  return { items, loading, error, refetch: fetch, optimisticToggle };
}
