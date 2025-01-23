"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LockClosedIcon, ClockIcon } from '@heroicons/react/24/solid';

interface Album {
  id: string;
  name: string;
  description: string;
  images: string[];
  mainowner: string;
}

interface TimeCapsule {
  id: string;
  albums: string;
  unlock_time: string;
  theme: string;
  reminders: boolean;
  reminderfreq: 'never' | 'daily' | 'weekly' | 'monthly';
  passwordtoggle: boolean;
  password?: string;
}

const THEMES = [
  { id: 'classic', name: 'Classic', color: 'bg-gray-100' },
  { id: 'vintage', name: 'Vintage', color: 'bg-amber-100' },
  { id: 'modern', name: 'Modern', color: 'bg-blue-100' },
  { id: 'dark', name: 'Dark', color: 'bg-gray-900' },
  { id: 'nature', name: 'Nature', color: 'bg-green-100' },
  { id: 'sunset', name: 'Sunset', color: 'bg-orange-100' },
  { id: 'ocean', name: 'Ocean', color: 'bg-cyan-100' },
  { id: 'royal', name: 'Royal', color: 'bg-purple-100' },
];

export default function AlbumsClient({ userEmail }: { userEmail: string }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateCapsuleOpen, setIsCreateCapsuleOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [openingDate, setOpeningDate] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [reminderFreq, setReminderFreq] = useState<'never' | 'daily' | 'weekly' | 'monthly'>('never');
  const [passwordToggle, setPasswordToggle] = useState(false);
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !openingDate || !openingTime || !selectedTheme) {
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
          albumId: selectedAlbum.id,
          openAt: openAtDate.toISOString(),
          theme: selectedTheme,
          reminders: reminderFreq !== 'never',
          reminderfreq: reminderFreq,
          passwordtoggle: passwordToggle,
          password: passwordToggle ? password : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create capsule');
      }

      setNotification({
        type: 'success',
        message: 'Capsule created successfully!'
      });
      setIsCreateCapsuleOpen(false);
      
      // Reset form
      setSelectedAlbum(null);
      setOpeningDate('');
      setOpeningTime('');
      setSelectedTheme(THEMES[0].id);
      setReminderFreq('never');
      setPasswordToggle(false);
      setPassword('');

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create capsule'
      });
    }
  };

  const canOpenCapsule = (unlockTime: string) => {
    return new Date(unlockTime) <= new Date();
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
        <h1 className="text-2xl font-bold">Your Albums</h1>
        <div className="space-x-4">
          <Link 
            href="/home" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Album
          </Link>
          <Link
            href="/timecapsules"
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            View Capsules
          </Link>
        </div>
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
              <Link href={`/albums/${album.id}`}>
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
              </Link>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{album.name}</h3>
                    {album.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{album.description}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAlbum(album);
                      setIsCreateCapsuleOpen(true);
                    }}
                    className="text-purple-500 hover:text-purple-600"
                    title="Create Time Capsule"
                  >
                    <ClockIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Capsule Modal */}
      <Transition appear show={isCreateCapsuleOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsCreateCapsuleOpen(false)}
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
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Create Time Capsule
                  </Dialog.Title>
                  <form onSubmit={handleCreateCapsule}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Album
                        </label>
                        <div className="mt-1 p-2 border rounded-md bg-gray-50">
                          {selectedAlbum?.name}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Opening Date
                        </label>
                        <input
                          type="date"
                          value={openingDate}
                          onChange={(e) => setOpeningDate(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {THEMES.map((theme) => (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setSelectedTheme(theme.id)}
                              className={`p-2 rounded-md ${theme.color} hover:opacity-90 ${
                                selectedTheme === theme.id ? 'ring-2 ring-purple-500' : ''
                              }`}
                            >
                              <span className="text-xs">{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reminders
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={reminderFreq !== 'never'}
                            onChange={(e) => setReminderFreq(e.target.checked ? 'daily' : 'never')}
                            className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-sm">Send reminders</span>
                        </div>
                        {reminderFreq !== 'never' && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reminder Frequency
                            </label>
                            <select
                              value={reminderFreq}
                              onChange={(e) => setReminderFreq(e.target.value as 'daily' | 'weekly' | 'monthly')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={passwordToggle}
                            onChange={(e) => setPasswordToggle(e.target.checked)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-sm">Require password to open</span>
                        </div>
                        {passwordToggle && (
                          <div className="mt-2">
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        onClick={() => setIsCreateCapsuleOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600"
                      >
                        Create Capsule
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
