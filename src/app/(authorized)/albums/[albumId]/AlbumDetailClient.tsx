'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CloudinaryImage } from "@/components/cloudinary-image";

interface Album {
  id: string;
  name: string;
  description: string;
  images: string[];
  mainowner: string;
}

export default function AlbumDetailClient({
  album,
  userEmail,
}: {
  album: Album;
  userEmail: string;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/albums"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Albums
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{album.name}</h1>
        {album.description && (
          <p className="text-gray-600 mb-4">{album.description}</p>
        )}
        <p className="text-sm text-gray-500">
          {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {album.images.map((imageUrl) => (
          <div
            key={imageUrl}
            className="relative aspect-square cursor-pointer hover:opacity-90"
            onClick={() => setSelectedImage(imageUrl)}
          >
            <CloudinaryImage
              src={imageUrl}
              alt=""
              width={300}
              height={300}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-4xl p-4">
            <CloudinaryImage
              src={selectedImage}
              alt=""
              width={1200}
              height={800}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      )}
    </main>
  );
}
