import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM activities ORDER BY sort_order ASC, id ASC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/activities:", err);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, sort_order } = await req.json();
    if (!title?.trim() || !category?.trim()) {
      return NextResponse.json({ error: "title and category are required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO activities (title, description, category, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), description?.trim() ?? null, category.trim(), sort_order ?? 0]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/activities:", err);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
