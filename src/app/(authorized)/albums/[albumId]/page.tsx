import { auth } from "@/lib/auth";
import AlbumDetailClient from "./AlbumDetailClient";
import { Pool } from "@neondatabase/serverless";

async function getAlbum(albumId: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const result = await pool.query(
      'SELECT * FROM albums WHERE id = $1',
      [albumId]
    );
    
    await pool.end();
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
}

export default async function AlbumPage({
  params: { albumId },
}: {
  params: { albumId: string };
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return null;
  }

  const album = await getAlbum(albumId);

  if (!album) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Album not found</h1>
          <p className="text-gray-600 mt-2">The album you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <AlbumDetailClient album={album} userEmail={session.user.email} />;
}
