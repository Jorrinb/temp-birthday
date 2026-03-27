import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "UPDATE players SET name = $1 WHERE id = $2 RETURNING id, name, created_at",
      [name.trim(), Number(id)]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PATCH /api/players/[id]:", err);
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // ON DELETE CASCADE on player_activity_status handles cleanup
    const { rowCount } = await pool.query("DELETE FROM players WHERE id = $1", [Number(id)]);

    if (rowCount === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/players/[id]:", err);
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
  }
}
