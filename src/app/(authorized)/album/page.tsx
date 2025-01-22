// Import necessary libraries and components
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth";
import { Album } from "@/lib/types";
import { AlbumCard } from "./album-card";
import { CreateAlbumDialog } from "./create-album-dialog";

// Initialize Neon with the database URL
const sql = neon(process.env.DATABASE_URL, { fullResults: false });

// Function to fetch albums for a specific user
async function getAlbums(userId: string): Promise<Album[]> {
  return await sql<Album[]>`
    SELECT *
    FROM albums
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

// Main AlbumsPage component
export default async function AlbumsPage() {
  // Authenticate the user
  const session = await auth();

  // If no user is logged in, return null
  if (!session?.user?.id) {
    return null;
  }

  // Fetch the albums for the logged-in user
  const albums = await getAlbums(session.user.id);

  // Render the AlbumsPage component
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Albums</h1>
        <CreateAlbumDialog />
      </div>

      {/* Display Albums or a Fallback Message */}
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
