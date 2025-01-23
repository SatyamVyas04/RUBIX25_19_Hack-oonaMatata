'use client';

import { useState, useEffect } from 'react';
import { CloudinaryImage } from "@/components/cloudinary-image";
import ClientVideoPlayer from "@/components/home/ClientVideoPlayer";
import CreateAlbumDialog from "@/components/home/CreateAlbumDialog";
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

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

export default function HomeClient({ initialImages, userName }: HomeClientProps) {
  const [images] = useState<ImageData[]>(initialImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddToAlbumOpen, setIsAddToAlbumOpen] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
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
      const response = await fetch('/api/albums/get');
      const data = await response.json();
      if (response.ok) {
        setAlbums(data.albums);
      } else {
        console.error('Failed to fetch albums:', data.error);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleCreateAlbum = async (albumName: string, description: string) => {
    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: selectedImages,
          albumName,
          description
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Failed to create album');
      }

      setNotification({
        type: 'success',
        message: data.message || 'Album created successfully!'
      });
      setIsDialogOpen(false);
      setIsSelectionMode(false);
      setSelectedImages([]);
      fetchAlbums(); // Refresh albums after creation

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('Error creating album:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create album'
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleAddToAlbum = async (albumId: string) => {
    try {
      const response = await fetch('/api/albums/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId,
          images: selectedImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Failed to add images to album');
      }

      setNotification({
        type: 'success',
        message: data.message || 'Images added to album successfully!'
      });
      setIsAddToAlbumOpen(false);
      setIsSelectionMode(false);
      setSelectedImages([]);

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('Error adding to album:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add images to album'
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <main className="p-8">
      <div className="mx-auto max-w-7xl">
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <XMarkIcon className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-80"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Photos</h1>
          <div className="space-x-4">
            <Link
              href="/albums"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              View Albums
            </Link>
            {!isSelectionMode && (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Select Images
              </button>
            )}
            {isSelectionMode && (
              <>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  disabled={selectedImages.length === 0}
                  className={`px-4 py-2 rounded-md ${
                    selectedImages.length === 0
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  Create Album ({selectedImages.length})
                </button>
                <button
                  onClick={() => setIsAddToAlbumOpen(true)}
                  className={`px-4 py-2 rounded-md ${
                    selectedImages.length === 0
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white transition-colors`}
                  disabled={selectedImages.length === 0}
                >
                  Add to Existing Album
                </button>
                <button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedImages([]);
                  }}
                  className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Albums Section */}
        {/* {albums.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    {album.images[0] && (
                      <CloudinaryImage
                        src={album.images[0]}
                        alt={album.name}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{album.name}</h3>
                    {album.description && (
                      <p className="text-gray-600 text-sm mb-2">{album.description}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        <div className="w-full p-4">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="mb-4 break-inside-avoid">
                <div 
                  className={`relative group cursor-pointer ${
                    isSelectionMode ? 'hover:opacity-90' : ''
                  }`}
                  onClick={() => isSelectionMode && toggleImageSelection(image.public_url)}
                >
                  {image.public_url.includes(`${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video`) ? (
                    <ClientVideoPlayer publicId={image.public_url.split('/upload/')[1]} />
                  ) : (
                    <>
                      <CloudinaryImage
                        src={image.public_url}
                        alt={`Image ${index + 1}`}
                        className={`w-full h-auto rounded-lg ${
                          selectedImages.includes(image.public_url)
                            ? 'ring-4 ring-blue-500'
                            : ''
                        }`}
                      />
                      {isSelectionMode && selectedImages.includes(image.public_url) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-[#b4b4b4]">
                No photos uploaded yet.
              </p>
            </div>
          )}
        </div>

        <CreateAlbumDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={(albumName, description) => handleCreateAlbum(albumName, description)}
        />

        {/* Add to Album Dialog */}
        {isAddToAlbumOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add to Album</h2>
                <button
                  onClick={() => setIsAddToAlbumOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {albums.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No albums found. Create a new album first.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {albums.map((album) => (
                    <button
                      key={album.id}
                      onClick={() => handleAddToAlbum(album.id)}
                      className="w-full text-left p-3 rounded hover:bg-gray-100 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium">{album.name}</h3>
                        <p className="text-sm text-gray-500">
                          {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
                        </p>
                      </div>
                      <span className="text-blue-500">Add here</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
