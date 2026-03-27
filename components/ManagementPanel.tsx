"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Player, Activity } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ManagementPanelProps {
  onClose: () => void;
  onPlayersChanged: () => void;
}

// ─── Sortable activity row ────────────────────────────────────────────────────

function SortableActivityRow({
  activity,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`
        flex items-center gap-2 px-3 py-2.5 rounded-xl border
        ${isDragging ? "border-[#c2185b] bg-[#0d0005] shadow-[0_0_15px_rgba(194,24,91,0.3)] z-50" : "border-[#8b1a4a]/40 bg-black"}
        transition-colors
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing px-1 touch-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 truncate">{activity.title}</p>
      </div>

      <button
        onClick={() => onEdit(activity)}
        className="text-gray-500 hover:text-gray-200 text-xs px-2 py-1 rounded border border-gray-800 hover:border-gray-600 transition-all"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(activity.id)}
        className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-gray-800 hover:border-red-900 transition-all"
      >
        Delete
      </button>
    </div>
  );
}

// ─── Activity form (add or edit) ──────────────────────────────────────────────

function ActivityForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Activity>;
  onSave: (data: { title: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSave({ title: title.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-gray-950 border border-[#8b1a4a]/50 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-[#c2185b] transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 mt-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Activity title"
        maxLength={100}
        className={inputClass}
        autoFocus
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm text-gray-400 border border-gray-800 hover:border-gray-600 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-[#8b1a4a] hover:bg-[#c2185b] disabled:opacity-50 transition-all"
        >
          {loading ? "Saving…" : initial?.id ? "Save Changes" : "Add Activity"}
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ManagementPanel({ onClose, onPlayersChanged }: ManagementPanelProps) {
  const [tab, setTab] = useState<"players" | "activities">("players");

  // Players state
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editingPlayerName, setEditingPlayerName] = useState("");
  const [savingPlayerId, setSavingPlayerId] = useState<number | null>(null);

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Confirm delete state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "player" | "activity";
    id: number;
    name: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchPlayers = useCallback(async () => {
    const res = await fetch("/api/players");
    if (res.ok) setPlayers(await res.json());
  }, []);

  const fetchActivities = useCallback(async () => {
    const res = await fetch("/api/activities");
    if (res.ok) setActivities(await res.json());
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchActivities();
  }, [fetchPlayers, fetchActivities]);

  // ── Players CRUD ────────────────────────────────────────────────────────────

  function startEditPlayer(player: Player) {
    setEditingPlayerId(player.id);
    setEditingPlayerName(player.name);
  }

  async function savePlayerRename(id: number) {
    const trimmed = editingPlayerName.trim();
    if (!trimmed) return;
    setSavingPlayerId(id);
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      await fetchPlayers();
      onPlayersChanged();
      setEditingPlayerId(null);
    } finally {
      setSavingPlayerId(null);
    }
  }

  async function deletePlayer(id: number) {
    const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchPlayers();
      onPlayersChanged();
    }
    setConfirmDelete(null);
  }

  // ── Activities CRUD ─────────────────────────────────────────────────────────

  async function addActivity(data: { title: string }) {
    const nextOrder = activities.length > 0 ? Math.max(...activities.map((a) => a.sort_order)) + 1 : 1;
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, category: "General", sort_order: nextOrder }),
    });
    if (!res.ok) throw new Error("Failed to add activity");
    await fetchActivities();
    setShowAddActivity(false);
  }

  async function saveActivityEdit(data: { title: string }) {
    if (!editingActivity) return;
    const res = await fetch(`/api/activities/${editingActivity.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update activity");
    await fetchActivities();
    setEditingActivity(null);
  }

  async function deleteActivity(id: number) {
    const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    if (res.ok) await fetchActivities();
    setConfirmDelete(null);
  }

  // ── Drag-and-drop reorder ───────────────────────────────────────────────────

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.id === active.id);
    const newIndex = activities.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(activities, oldIndex, newIndex);

    // Optimistic update
    setActivities(reordered);

    // Persist new sort_order values
    await Promise.all(
      reordered.map((a, i) =>
        fetch(`/api/activities/${a.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i + 1 }),
        })
      )
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const tabClass = (active: boolean) =>
    `flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? "bg-[#8b1a4a] text-white shadow-[0_0_10px_rgba(139,26,74,0.4)]"
        : "text-gray-400 hover:text-gray-200"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-black border border-[#8b1a4a] rounded-2xl shadow-[0_0_30px_rgba(139,26,74,0.4)] flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#8b1a4a]/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="text-lg font-bold text-gray-100">Party Control Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-[#8b1a4a]/30 flex-shrink-0">
          <button className={tabClass(tab === "players")} onClick={() => setTab("players")}>
            👥 Players
          </button>
          <button className={tabClass(tab === "activities")} onClick={() => setTab("activities")}>
            📋 Activities
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* ── Players tab ── */}
          {tab === "players" && (
            <>
              {players.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-6">No players yet</p>
              )}
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#8b1a4a]/40 bg-black"
                >
                  {editingPlayerId === player.id ? (
                    <>
                      <input
                        type="text"
                        value={editingPlayerName}
                        onChange={(e) => setEditingPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && savePlayerRename(player.id)}
                        autoFocus
                        maxLength={40}
                        className="flex-1 bg-gray-950 border border-[#c2185b] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none"
                      />
                      <button
                        onClick={() => savePlayerRename(player.id)}
                        disabled={savingPlayerId === player.id}
                        className="text-xs px-2 py-1.5 rounded border border-[#8b1a4a] text-gray-200 hover:bg-[#8b1a4a] transition-all"
                      >
                        {savingPlayerId === player.id ? "…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        className="text-xs px-2 py-1.5 rounded border border-gray-800 text-gray-400 hover:border-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-200 truncate">{player.name}</span>
                      <button
                        onClick={() => startEditPlayer(player)}
                        className="text-gray-500 hover:text-gray-200 text-xs px-2 py-1 rounded border border-gray-800 hover:border-gray-600 transition-all"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ type: "player", id: player.id, name: player.name })
                        }
                        className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded border border-gray-800 hover:border-red-900 transition-all"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── Activities tab ── */}
          {tab === "activities" && (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activities.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {activities.map((activity) =>
                    editingActivity?.id === activity.id ? (
                      <div key={activity.id} className="px-3 py-2 rounded-xl border border-[#c2185b]/50 bg-black">
                        <p className="text-xs text-gray-500 mb-1">Editing: {activity.title}</p>
                        <ActivityForm
                          initial={editingActivity}
                          onSave={saveActivityEdit}
                          onCancel={() => setEditingActivity(null)}
                        />
                      </div>
                    ) : (
                      <SortableActivityRow
                        key={activity.id}
                        activity={activity}
                        onEdit={setEditingActivity}
                        onDelete={(id) =>
                          setConfirmDelete({ type: "activity", id, name: activity.title })
                        }
                      />
                    )
                  )}
                </SortableContext>
              </DndContext>

              {activities.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No activities yet</p>
              )}

              {/* Add activity form or button */}
              {showAddActivity ? (
                <div className="px-3 py-2 rounded-xl border border-[#8b1a4a]/50 bg-black mt-2">
                  <ActivityForm
                    onSave={addActivity}
                    onCancel={() => setShowAddActivity(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddActivity(true)}
                  className="w-full py-2.5 rounded-xl text-sm text-gray-300 border border-dashed border-[#8b1a4a]/50 hover:border-[#c2185b] hover:text-white transition-all mt-2"
                >
                  + Add Activity
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="relative bg-black border border-red-900 rounded-2xl shadow-[0_0_20px_rgba(255,0,0,0.2)] p-6 w-full max-w-xs animate-slide-up">
            <h3 className="text-base font-bold text-gray-100 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-400 mb-5">
              Delete{" "}
              <span className="text-gray-200 font-medium">"{confirmDelete.name}"</span>?
              {confirmDelete.type === "player"
                ? " This will also delete all their checklist progress."
                : " This will remove it from all players' checklists."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl text-sm text-gray-400 border border-gray-800 hover:border-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmDelete.type === "player"
                    ? deletePlayer(confirmDelete.id)
                    : deleteActivity(confirmDelete.id)
                }
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-900 hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
