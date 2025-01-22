// GET and POST /api/album
import { auth } from "@/lib/auth";
import { sql } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  try {
    await sql`
      INSERT INTO albums (name, description, user_id)
      VALUES (${name}, ${description}, ${session.user.id})
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

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { rows } = await sql`
    SELECT *
    FROM albums
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `;

  return NextResponse.json(rows);
}