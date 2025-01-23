import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { albumId, collaborator } = await req.json();

    // Validate input
    if (!albumId || !collaborator || !collaborator.userid) {
      return NextResponse.json(
        { error: "Invalid input. Album ID and collaborator are required." },
        { status: 400 },
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(collaborator.userid)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    // Verify that the current user owns the album or has permission to share it
    const ownershipResult = await pool.query(
      `
      SELECT 1
      FROM albums
      WHERE id = $1 AND (mainowner = $2
      OR EXISTS (
        SELECT 1
        FROM json_array_elements(collab) AS c
        WHERE c->>'userid' = $2 AND (c->>'permission' = 'editor')
      ))
      `,
      [albumId, session.user.email],
    );

    if (ownershipResult.rowCount === 0) {
      return NextResponse.json(
        { error: "You don't have permission to share this album." },
        { status: 403 },
      );
    }

    // Fetch current collaborators
    const currentAlbumResult = await pool.query(
      `SELECT collab FROM albums WHERE id = $1`,
      [albumId],
    );

    const currentCollab = currentAlbumResult.rows[0]?.collab || [];

    const existingCollabIndex = currentCollab.findIndex(
      (existingCollab: { userid: string }) =>
        existingCollab.userid === collaborator.userid,
    );

    if (existingCollabIndex !== -1) {
      const existingCollab = currentCollab[existingCollabIndex];
      // If existing collaborator is a viewer and request is to make them an editor
      if (
        existingCollab.permission === "viewer" &&
        collaborator.permission === "editor"
      ) {
        currentCollab[existingCollabIndex].permission = "editor";

        await pool.query(
          `
        UPDATE albums
        SET collab = $1
        WHERE id = $2
        `,
          [JSON.stringify(currentCollab), albumId],
        );

        return NextResponse.json({
          message: "Collaborator permission upgraded to editor!",
          collaborator: {
            userid: collaborator.userid,
            permission: "editor",
          },
        });
      }

      return NextResponse.json(
        {
          error:
            "Collaborator already exists with the same or higher permission.",
        },
        { status: 400 },
      );
    }

    // Add new collaborator
    const updatedCollab = [
      ...currentCollab,
      {
        userid: collaborator.userid,
        permission: collaborator.permission || "viewer",
      },
    ];

    await pool.query(
      `
      UPDATE albums
      SET collab = $1
      WHERE id = $2
      `,
      [JSON.stringify(updatedCollab), albumId],
    );

    return NextResponse.json({
      message: "Collaborator added successfully!",
      collaborator: {
        userid: collaborator.userid,
        permission: collaborator.permission || "viewer",
      },
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      {
        error: "Failed to add collaborator",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await pool.end();
  }
}
