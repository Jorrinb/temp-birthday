"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `fn` immediately on mount then every `interval` milliseconds.
 * Cleans up the interval on unmount or when dependencies change.
 */
export function usePolling(fn: () => void, interval: number, enabled = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;

    fnRef.current();
    const id = setInterval(() => fnRef.current(), interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
}
