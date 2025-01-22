// GET and POST /api/album
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  });
  //Query to get all albums, ordered by creation date
  try {
    const query = `
      SELECT * FROM albums
      ORDER BY created_at DESC;
    `;

    const { rows } = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  });
  const data = await req.json();
  //separate the data into fields and values (prevent so called sql injection)
  try {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO albums (${fields.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
