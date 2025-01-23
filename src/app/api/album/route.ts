import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  });

  try {
    const query = `SELECT * FROM albums`;
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

import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, images, collab } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Missing required field: name" },
      { status: 400 },
    );
  }

  const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  });

  try {
    const userQuery = `SELECT id FROM users WHERE email = $1`;
    const userResult = await pool.query(userQuery, [session.user.email]);
    const mainowner = userResult.rows[0]?.id;

    if (!mainowner) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    const query = `
      INSERT INTO albums (name, description, images, collab, mainowner)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      name,
      description || null,
      images || [],
      collab || [],
      mainowner,
    ];

    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error inserting album record:", error);
    return NextResponse.json(
      { error: "Failed to save album record" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
