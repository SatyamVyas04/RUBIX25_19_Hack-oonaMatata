"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
    <main className="container mx-auto px-4 py-2">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/albums"
          className="flex items-center text-zinc-600 hover:text-zinc-700"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Back to Albums
        </Link>
      </div>

      <div className="mb-8 flex w-full items-start justify-between sm:flex-row">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{album.name}</h1>
          <h2 className="mb-2 text-sm font-bold text-pink-500">
            Created by {album.mainowner}
          </h2>
          {album.description && (
            <p className="mb-2 text-sm text-zinc-600">{album.description}</p>
          )}
          <p className="text-sm text-zinc-500">
            {album.images.length}{" "}
            {album.images.length === 1 ? "photo" : "photos"}
          </p>
        </div>
        {album.mainowner === userEmail && (
          <Button variant="outline">
            SHARE{" "}
            <DotLottieReact
              src="/images/share.json"
              className="relative z-10 -mx-4 w-14"
              useFrameInterpolation
              autoplay
              playOnHover
            />
          </Button>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-h-4xl relative h-full w-full max-w-4xl p-4">
            <CloudinaryImage
              src={selectedImage}
              alt=""
              className="mx-auto h-screen w-fit object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
