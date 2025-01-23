'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
      const response = await fetch('/api/albums/get');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch albums');
      }
      
      setAlbums(data.albums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch albums');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Albums</h1>
        <Link 
          href="/home" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Album
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No albums yet. Create your first album!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link 
              key={album.id} 
              href={`/albums/${album.id}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {album.images[0] ? (
                  <CloudinaryImage
                    src={album.images[0]}
                    alt={album.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No images</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{album.name}</h3>
                {album.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{album.description}</p>
                )}
                <p className="text-gray-500 text-sm">
                  {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
