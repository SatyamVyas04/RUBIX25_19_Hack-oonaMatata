import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const albumId = params.id;

  if (!albumId) {
    return NextResponse.json(
      { error: "Missing album ID in request" },
      { status: 400 },
    );
  }

  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Verify the album's ownership before deleting
    const verifyQuery = `SELECT * FROM albums WHERE id = $1 AND mainowner = $2`;
    const verifyResult = await pool.query(verifyQuery, [albumId, mainowner]);

    if (verifyResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Album not found or you do not have permission to delete it" },
        { status: 403 },
      );
    }

    const deleteQuery = `DELETE FROM albums WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(deleteQuery, [albumId]);

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error deleting album:", error);
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const albumId = params.id;

  if (!albumId) {
    return NextResponse.json(
      { error: "Missing album ID in request" },
      { status: 400 },
    );
  }

  const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  });

  try {
    const query = `SELECT * FROM albums WHERE id = $1`;
    const { rows } = await pool.query(query, [albumId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching album by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
