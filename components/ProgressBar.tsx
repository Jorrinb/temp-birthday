"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Progress</span>
        <span className="text-xs font-semibold text-gray-200">
          {completed}/{total} &mdash; {pct}%
        </span>
      </div>
      <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-[#8b1a4a]/40">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #8b1a4a, #c2185b)",
            boxShadow: pct > 0 ? "0 0 8px rgba(194,24,91,0.6)" : "none",
          }}
        />
      </div>
    </div>
  );
}
