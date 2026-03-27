"use client";

import { useRef } from "react";
import confetti from "canvas-confetti";
import type { ChecklistEntry } from "@/lib/types";

interface ChecklistItemProps {
  item: ChecklistEntry;
  onToggle: (activityId: number) => void;
  disabled?: boolean;
}

export default function ChecklistItem({ item, onToggle, disabled }: ChecklistItemProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleToggle() {
    if (disabled) return;

    // Fire confetti when completing (not uncompleting)
    if (!item.is_completed) {
      const rect = btnRef.current?.getBoundingClientRect();
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.6;
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { x, y },
        colors: ["#c2185b", "#e91e63", "#ffffff", "#f8bbd0", "#ff80ab"],
        scalar: 0.9,
        gravity: 1.1,
      });
    }

    onToggle(item.id);
  }

  return (
    <button
      ref={btnRef}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        group w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left
        border transition-all duration-200
        ${
          item.is_completed
            ? "border-[#8b1a4a]/40 bg-[#0d0005]/60 opacity-60"
            : "border-[#8b1a4a]/50 bg-black hover:border-[#c2185b] hover:bg-[#0d0005] hover:shadow-[0_0_12px_rgba(194,24,91,0.25)]"
        }
        disabled:cursor-not-allowed
      `}
    >
      {/* Checkbox circle */}
      <div
        className={`
          mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${item.is_completed ? "border-[#c2185b] bg-[#c2185b]" : "border-[#8b1a4a] group-hover:border-[#c2185b]"}
        `}
      >
        {item.is_completed && (
          <svg
            className="w-3 h-3 text-white animate-[checkPop_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            text-sm font-medium leading-snug transition-all duration-200
            ${item.is_completed ? "text-gray-500 line-through" : "text-gray-100"}
          `}
        >
          {item.title}
        </p>
        {item.description && (
          <p
            className={`
              text-xs mt-0.5 transition-all duration-200
              ${item.is_completed ? "text-gray-600 line-through" : "text-gray-500"}
            `}
          >
            {item.description}
          </p>
        )}
        {item.is_completed && item.completed_at && (
          <p className="text-xs text-[#8b1a4a] mt-1">
            ✓ Done at{" "}
            {new Date(item.completed_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </button>
  );
}
