// GET, PATCH, DELETE /api/capsule/[id]
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const capsuleId = params.id;

  try {
    const query = `
      SELECT * FROM capsules
      WHERE id = $1;
    `;

    const { rows } = await pool.query(query, [capsuleId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching capsule:", error);
    return NextResponse.json(
      { error: "Failed to fetch capsule" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const capsuleId = params.id;
  const updates = await req.json();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE capsules
      SET ${fields}
      WHERE id = $1
      RETURNING *;
    `;

    const values = [capsuleId, ...Object.values(updates)];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error updating capsule:", error);
    return NextResponse.json(
      { error: "Failed to update capsule" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const capsuleId = params.id;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const query = `
      DELETE FROM capsules
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [capsuleId]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Capsule deleted successfully" });
  } catch (error) {
    console.error("Error deleting capsule:", error);
    return NextResponse.json(
      { error: "Failed to delete capsule" },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
