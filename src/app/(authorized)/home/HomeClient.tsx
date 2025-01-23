"use client";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { CloudinaryImage } from "@/components/cloudinary-image";
import ClientVideoPlayer from "@/components/home/ClientVideoPlayer";
import CreateAlbumDialog from "@/components/home/CreateAlbumDialog";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";

interface ImageData {
  public_url: string;
}

interface Album {
  id: string;
  name: string;
  description: string;
  images: string[];
  mainowner: string;
}

interface HomeClientProps {
  initialImages: ImageData[];
  userName: string;
}

export default function HomeClient({
  initialImages,
  userName,
}: HomeClientProps) {
  const [images] = useState<ImageData[]>(initialImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddToAlbumOpen, setIsAddToAlbumOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isAddToAlbumOpen) {
      fetchAlbums();
    }
  }, [isAddToAlbumOpen]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/albums/getedit");
      const data = await response.json();
      if (response.ok) {
        setAlbums(data.albums);
      } else {
        console.error("Failed to fetch albums:", data.error);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl],
    );
  };

  const handleCreateAlbum = async (albumName: string, description: string) => {
    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: selectedImages,
          albumName,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || "Failed to create album");
      }

      setNotification({
        type: "success",
        message: data.message || "Album created successfully!",
      });
      setIsDialogOpen(false);
      setIsSelectionMode(false);
      setSelectedImages([]);
      fetchAlbums();

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error creating album:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create album",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleAddToAlbum = async (albumId: string) => {
    try {
      const response = await fetch("/api/albums/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId,
          images: selectedImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || "Failed to add images to album");
      }

      setNotification({
        type: "success",
        message: data.message || "Images added to album successfully!",
      });
      setIsAddToAlbumOpen(false);
      setIsSelectionMode(false);
      setSelectedImages([]);

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error("Error adding to album:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to add images to album",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <main className="p-2">
      <div className="mx-auto max-w-7xl">
        {notification && (
          <div
            className={`fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-sm p-4 shadow-lg ${
              notification.type === "success"
                ? "bg-accent text-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5 text-pink-500" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-foreground" />
            )}
            <span>{notification.message}</span>
            <Button
              onClick={() => setNotification(null)}
              className="ml-2 rounded-sm hover:opacity-80"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="mx-2 text-2xl font-bold text-foreground">
            Your Photos
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/albums" className="">
              <Button className="w-full rounded-sm bg-muted px-4 py-2 text-center text-foreground hover:bg-background">
                View Albums
              </Button>
            </Link>
            <Link
              href="/timecapsules"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Time Capsules
            </Link>
            {!isSelectionMode && (
              <Button
                onClick={() => setIsSelectionMode(true)}
                className="rounded-sm bg-pink-500 px-4 py-2 text-center hover:bg-pink-600 dark:text-white"
              >
                Select Images
              </Button>
            )}
            {isSelectionMode && (
              <>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  disabled={selectedImages.length === 0}
                  className={`rounded-sm px-4 py-2 text-center ${
                    selectedImages.length === 0
                      ? "cursor-not-allowed bg-muted"
                      : "bg-pink-500 hover:bg-pink-600 dark:text-white"
                  }`}
                >
                  Create Album ({selectedImages.length})
                </Button>
                <Button
                  onClick={() => setIsAddToAlbumOpen(true)}
                  disabled={selectedImages.length === 0}
                  className={`rounded-sm px-4 py-2 text-center ${
                    selectedImages.length === 0
                      ? "cursor-not-allowed bg-muted"
                      : "bg-accent hover:bg-pink-600 dark:text-white"
                  }`}
                >
                  Add to Existing Album
                </Button>
                <Button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedImages([]);
                  }}
                  className="rounded-sm bg-muted px-4 py-2 text-center text-foreground hover:bg-background"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="w-full p-2">
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
            {images.map((image, index) => (
              <BlurFade
                key={image.public_url}
                delay={0.25 + index * 0.05}
                inView
              >
                <div key={index} className="mb-4 break-inside-avoid">
                  <div
                    className={`group relative cursor-pointer ${
                      isSelectionMode ? "hover:opacity-90" : ""
                    }`}
                    onClick={() =>
                      isSelectionMode && toggleImageSelection(image.public_url)
                    }
                  >
                    {image.public_url.includes(
                      `${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video`,
                    ) ? (
                      <ClientVideoPlayer
                        publicId={image.public_url.split("/upload/")[1]}
                      />
                    ) : (
                      <>
                        <CloudinaryImage
                          src={image.public_url}
                          alt={`Image ${index + 1}`}
                          className={`h-auto w-full rounded-lg ${
                            selectedImages.includes(image.public_url)
                              ? "ring-4 ring-pink-500"
                              : ""
                          }`}
                        />
                        {isSelectionMode &&
                          selectedImages.includes(image.public_url) && (
                            <div className="absolute right-2 top-2">
                              <CheckCircleIcon className="h-6 w-6 text-pink-500" />
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>

          {images.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg">No photos uploaded yet.</p>
            </div>
          )}
        </div>

        <CreateAlbumDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={(albumName, description) =>
            handleCreateAlbum(albumName, description)
          }
        />

        {isAddToAlbumOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-sm bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Add to Album
                </h3>
                <Button
                  onClick={() => setIsAddToAlbumOpen(false)}
                  className="rounded-sm p-2 hover:bg-muted"
                >
                  <XMarkIcon className="h-5 w-5 text-foreground" />
                </Button>
              </div>
              <div className="mb-4 space-y-2">
                {albums.map((album) => (
                  <Button
                    key={album.id}
                    onClick={() => handleAddToAlbum(album.id)}
                    className="block w-full rounded-sm bg-muted px-4 py-2 text-left text-foreground hover:bg-pink-500 hover:dark:text-white"
                  >
                    {album.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}