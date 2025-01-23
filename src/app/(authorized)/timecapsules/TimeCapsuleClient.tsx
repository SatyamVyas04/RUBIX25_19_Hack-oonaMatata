'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CloudinaryImage } from "@/components/cloudinary-image";
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';

interface Album {
  id: string;
  name: string;
  description: string;
  images: string[];
}

interface TimeCapsule {
  id: string;
  album_id: string;
  album_name: string;
  open_at: string;
  created_at: string;
  is_opened: boolean;
  images: string[];
}

export default function TimeCapsuleClient({ userEmail }: { userEmail: string }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [openingDate, setOpeningDate] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchAlbums();
    fetchCapsules();
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

  const fetchCapsules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/timecapsules');
      const data = await response.json();
      if (response.ok) {
        setCapsules(data.capsules);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch time capsules');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbumId || !openingDate || !openingTime) {
      setNotification({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    const openAtDate = new Date(openingDate + 'T' + openingTime);
    if (openAtDate <= new Date()) {
      setNotification({
        type: 'error',
        message: 'Opening time must be in the future'
      });
      return;
    }

    try {
      const response = await fetch('/api/timecapsules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: selectedAlbumId,
          openAt: openAtDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create time capsule');
      }

      setNotification({
        type: 'success',
        message: 'Time capsule created successfully!'
      });
      setIsCreateModalOpen(false);
      fetchCapsules();
      
      // Reset form
      setSelectedAlbumId('');
      setOpeningDate('');
      setOpeningTime('');
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create time capsule'
      });
    }
  };

  const canOpenCapsule = (openAt: string) => {
    return new Date(openAt) <= new Date();
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
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Time Capsules</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Time Capsule
        </button>
      </div>

      {capsules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No time capsules yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {capsule.images[0] && (
                  <div className="relative">
                    <CloudinaryImage
                      src={capsule.images[0]}
                      alt={capsule.album_name}
                      width={400}
                      height={300}
                      className={`object-cover w-full h-full ${
                        !canOpenCapsule(capsule.open_at) ? 'blur-lg' : ''
                      }`}
                    />
                    {!canOpenCapsule(capsule.open_at) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LockClosedIcon className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{capsule.album_name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Opens: {new Date(capsule.open_at).toLocaleString()}
                </p>
                {canOpenCapsule(capsule.open_at) ? (
                  <Link
                    href={`/albums/${capsule.album_id}`}
                    className="inline-flex items-center text-blue-500 hover:text-blue-600"
                  >
                    <LockOpenIcon className="h-4 w-4 mr-1" />
                    View Album
                  </Link>
                ) : (
                  <p className="text-gray-400 flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Locked
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Time Capsule Modal */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsCreateModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create Time Capsule
                  </Dialog.Title>
                  <form onSubmit={handleCreateCapsule}>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select Album
                        </label>
                        <select
                          value={selectedAlbumId}
                          onChange={(e) => setSelectedAlbumId(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select an album</option>
                          {albums.map((album) => (
                            <option key={album.id} value={album.id}>
                              {album.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Opening Date
                        </label>
                        <input
                          type="date"
                          value={openingDate}
                          onChange={(e) => setOpeningDate(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={openingTime}
                          onChange={(e) => setOpeningTime(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </main>
  );
}
