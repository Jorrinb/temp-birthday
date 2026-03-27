import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.name,
        COUNT(s.id) FILTER (WHERE s.is_completed = true) AS completed,
        (SELECT COUNT(*) FROM activities)                  AS total
      FROM players p
      LEFT JOIN player_activity_status s ON s.player_id = p.id
      GROUP BY p.id, p.name
      ORDER BY completed DESC, p.name ASC
    `);

    // Postgres returns numeric aggregates as strings — cast them
    const parsed = rows.map((r) => ({
      id: r.id,
      name: r.name,
      completed: Number(r.completed),
      total: Number(r.total),
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("GET /api/leaderboard:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
