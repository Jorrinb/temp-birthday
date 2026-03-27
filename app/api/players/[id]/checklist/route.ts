import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const { rows } = await pool.query(
      `SELECT
         a.id,
         a.title,
         a.description,
         a.category,
         a.sort_order,
         a.created_at,
         a.updated_at,
         COALESCE(s.is_completed, false) AS is_completed,
         s.completed_at
       FROM activities a
       LEFT JOIN player_activity_status s
         ON s.activity_id = a.id AND s.player_id = $1
       ORDER BY a.sort_order ASC, a.id ASC`,
      [Number(id)]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/players/[id]/checklist:", err);
    return NextResponse.json({ error: "Failed to fetch checklist" }, { status: 500 });
  }
}
