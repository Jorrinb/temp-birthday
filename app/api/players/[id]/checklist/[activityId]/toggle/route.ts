import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = { params: Promise<{ id: string; activityId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id, activityId } = await params;
    const playerId = Number(id);
    const actId = Number(activityId);

    // Check current state
    const { rows: existing } = await pool.query(
      "SELECT is_completed FROM player_activity_status WHERE player_id = $1 AND activity_id = $2",
      [playerId, actId]
    );

    const currentlyCompleted = existing[0]?.is_completed ?? false;
    const newCompleted = !currentlyCompleted;
    const completedAt = newCompleted ? new Date() : null;

    const { rows } = await pool.query(
      `INSERT INTO player_activity_status (player_id, activity_id, is_completed, completed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (player_id, activity_id) DO UPDATE
         SET is_completed = EXCLUDED.is_completed,
             completed_at = EXCLUDED.completed_at
       RETURNING *`,
      [playerId, actId, newCompleted, completedAt]
    );

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("POST toggle:", err);
    return NextResponse.json({ error: "Failed to toggle item" }, { status: 500 });
  }
}
