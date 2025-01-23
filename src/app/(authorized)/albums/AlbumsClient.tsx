"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CloudinaryImage } from "@/components/cloudinary-image";

interface Album {
  id: string;
  name: string;
  description: string;
  images: string[];
  mainowner: string;
}

export default function AlbumsClient({ userEmail }: { userEmail: string }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/albums/getall");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch albums");
      }

      setAlbums(data.albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch albums",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-pink-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Your Albums</h1>
        <Link
          href="/home"
          className="rounded-md bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-600"
        >
          Create New Album
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No albums yet. Create your first album!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className="block overflow-hidden rounded-md bg-card shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {album.images[0] ? (
                  <CloudinaryImage
                    src={album.images[0]}
                    alt={album.name}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No images</span>
                  </div>
                )}
              </div>
              <div className="flex flex-row items-start justify-between p-4">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {album.name}
                  </h3>
                  {album.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {album.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {album.images.length}{" "}
                    {album.images.length === 1 ? "photo" : "photos"}
                  </p>
                </div>
                <div className="h-fit rounded-full bg-pink-500 px-2 py-1 text-sm font-bold">
                  <div>
                    {album.mainowner === userEmail ? "Owner" : "Collaborator"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
