import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Build update fields dynamically so partial updates are supported
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.title !== undefined) { fields.push(`title = $${idx++}`); values.push(body.title.trim()); }
    if (body.description !== undefined) { fields.push(`description = $${idx++}`); values.push(body.description?.trim() ?? null); }
    if (body.category !== undefined) { fields.push(`category = $${idx++}`); values.push(body.category.trim()); }
    if (body.sort_order !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(Number(body.sort_order)); }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    fields.push(`updated_at = NOW()`);
    values.push(Number(id));

    const { rows } = await pool.query(
      `UPDATE activities SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PATCH /api/activities/[id]:", err);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // ON DELETE CASCADE on player_activity_status handles cleanup
    const { rowCount } = await pool.query("DELETE FROM activities WHERE id = $1", [Number(id)]);

    if (rowCount === 0) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/activities/[id]:", err);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
