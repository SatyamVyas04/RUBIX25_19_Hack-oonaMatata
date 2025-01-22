// GET, PATCH, DELETE /api/album/[id]
import { auth } from "@/lib/auth";
import { sql } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Verify user owns the album
  const { rows } = await sql`
    SELECT user_id FROM albums WHERE id = ${params.id}
  `;

  if (rows.length === 0 || rows[0].user_id !== session.user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Delete album (will cascade to album_images)
  await sql`DELETE FROM albums WHERE id = ${params.id}`;

  revalidatePath("/album");
  return new NextResponse(null, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  // Verify user owns the album
  const { rows } = await sql`
    SELECT user_id FROM albums WHERE id = ${params.id}
  `;

  if (rows.length === 0 || rows[0].user_id !== session.user.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await sql`
      UPDATE albums
      SET name = ${name}, description = ${description}
      WHERE id = ${params.id}
    `;

    revalidatePath("/album");
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    if (error.code === "23505") {
      return new NextResponse("Album name already exists", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { rows: [album] } = await sql`
    SELECT a.*, array_agg(i.*) as images
    FROM albums a
    LEFT JOIN album_images ai ON ai.album_id = a.id
    LEFT JOIN images i ON i.id = ai.image_id
    WHERE a.id = ${params.id} AND a.user_id = ${session.user.id}
    GROUP BY a.id
  `;

  if (!album) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(album);
}