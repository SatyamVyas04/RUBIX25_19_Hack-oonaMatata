import { auth } from "@/lib/auth";
import { sql } from "@neondatabase/serverless";
import { Album } from "@/lib/types";
import { AlbumCard } from "./album-card";
import { CreateAlbumDialog } from "./create-album-dialog";

async function getAlbums(userId: string) {
  const { rows } = await sql<Album>`
    SELECT *
    FROM albums
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows;
}

export default async function AlbumsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const albums = await getAlbums(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Albums</h1>
        <CreateAlbumDialog />
      </div>

      {albums.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No albums yet. Create your first album to get started!
          </p>
        </div>
      )}
    </div>
  );
}