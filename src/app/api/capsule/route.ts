// GET and POST /api/capsule
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    albums,
    unlock_time,
    reminders,
    reminderfreq,
    theme,
    passwordtoggle,
    password,
  } = await req.json();

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const query = `
      INSERT INTO capsules (albums, unlock_time, reminders, reminderfreq, theme, passwordtoggle, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      albums,
      unlock_time,
      reminders,
      reminderfreq,
      theme,
      passwordtoggle,
      password,
    ]);

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error creating capsule:", error);
    return NextResponse.json(
      { error: "Failed to create capsule" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const query = `
      SELECT * FROM capsules
      WHERE id IN (
        SELECT id
        FROM capsules
        WHERE $1 = ANY(albums)
      );
    `;

    const { rows } = await pool.query(query, [session.user.id]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching capsules:", error);
    return NextResponse.json(
      { error: "Failed to fetch capsules" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
