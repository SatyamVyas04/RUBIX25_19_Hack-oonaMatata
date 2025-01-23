import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Get all albums where user is mainowner or collaborator
    const albumsResult = await pool.query(
      `SELECT * FROM albums 
       WHERE mainowner = $1 
       OR $1 = ANY(SELECT jsonb_array_elements_text(collab))
       ORDER BY id DESC`,
      [session.user.email]
    );

    await pool.end();

    return NextResponse.json({ 
      albums: albumsResult.rows 
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch albums',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
