import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, created_at FROM players ORDER BY created_at ASC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/players:", err);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "INSERT INTO players (name) VALUES ($1) RETURNING id, name, created_at",
      [name.trim()]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/players:", err);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
