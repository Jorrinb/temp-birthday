"use client";

import { useState, useRef, useEffect } from "react";

interface AddPlayerModalProps {
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}

export default function AddPlayerModal({ onClose, onAdd }: AddPlayerModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onAdd(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-black border border-[#8b1a4a] rounded-2xl shadow-[0_0_30px_rgba(139,26,74,0.4)] p-6 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-100 mb-1">Add a Character</h2>
        <p className="text-gray-500 text-sm mb-5">Enter a nickname for the new player</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah ✨"
            maxLength={40}
            className="
              w-full bg-gray-950 border border-[#8b1a4a]/60 rounded-xl px-4 py-3
              text-gray-100 placeholder-gray-600 text-sm
              focus:outline-none focus:border-[#c2185b] focus:shadow-[0_0_10px_rgba(194,24,91,0.3)]
              transition-all
            "
          />

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400
                border border-gray-800 hover:border-gray-600 hover:text-gray-200
                transition-all
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="
                flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-[#8b1a4a] hover:bg-[#c2185b]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all shadow-[0_0_12px_rgba(139,26,74,0.4)]
              "
            >
              {loading ? "Adding…" : "Add Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
