"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";

interface Album {
  id: string;
  name: string;
  description: string;
  images: string[];
}

interface TimeCapsule {
  id: string;
  albums: string[];
  album_name: string;
  unlock_time: string;
  created_at: string;
  theme: string;
  reminders: boolean;
  reminderfreq: string;
  passwordtoggle: boolean;
  password?: string;
  images: string[];
}

export default function TimeCapsuleClient({
  userEmail,
}: {
  userEmail: string;
}) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [openingDate, setOpeningDate] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [theme, setTheme] = useState("classic");
  const [reminders, setReminders] = useState(false);
  const [reminderFreq, setReminderFreq] = useState("never");
  const [passwordToggle, setPasswordToggle] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchAlbums();
    fetchCapsules();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/albums/get");
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

  const fetchCapsules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/timecapsules");
      const data = await response.json();
      if (response.ok) {
        setCapsules(data.capsules);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to fetch time capsules");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbumId || !openingDate || !openingTime) {
      setNotification({
        type: "error",
        message: "Please fill in all fields",
      });
      return;
    }

    const openAtDate = new Date(openingDate + "T" + openingTime);
    if (openAtDate <= new Date()) {
      setNotification({
        type: "error",
        message: "Opening time must be in the future",
      });
      return;
    }

    try {
      const response = await fetch("/api/timecapsules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          albumId: selectedAlbumId,
          openAt: openAtDate.toISOString(),
          theme,
          reminders,
          reminderfreq: reminderFreq,
          passwordtoggle: passwordToggle,
          password: passwordToggle ? password : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create time capsule");
      }

      setNotification({
        type: "success",
        message: "Time capsule created successfully!",
      });
      setIsCreateModalOpen(false);
      fetchCapsules();

      // Reset form
      setSelectedAlbumId("");
      setOpeningDate("");
      setOpeningTime("");
      setTheme("classic");
      setReminders(false);
      setReminderFreq("never");
      setPasswordToggle(false);
      setPassword("");
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create time capsule",
      });
    }
  };

  const canOpenCapsule = (openAt: string) => {
    return new Date(openAt) <= new Date();
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-2">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Time Capsules</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Create Time Capsule
          </button>
        </div>
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-b-4 border-t-4 border-transparent border-b-pink-500 border-t-pink-500"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-2">
      {notification && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-md p-4 shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time Capsules</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Create Time Capsule
        </button>
      </div>

      {capsules.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-zinc-500">
            No time capsules yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className="bg-zinc overflow-hidden rounded-lg shadow-md"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {capsule.images[0] && (
                  <div className="relative">
                    <CloudinaryImage
                      src={capsule.images[0]}
                      alt={capsule.album_name}
                      width={400}
                      height={300}
                      className={`h-full w-full object-cover ${
                        !canOpenCapsule(capsule.unlock_time) ? "blur-lg" : ""
                      }`}
                    />
                    {!canOpenCapsule(capsule.unlock_time) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LockClosedIcon className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-lg font-semibold">
                  {capsule.album_name}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    {!canOpenCapsule(capsule.unlock_time) ? (
                      <>
                        <LockClosedIcon className="mr-1 inline h-4 w-4" />
                        Opens {new Date(capsule.unlock_time).toLocaleString()}
                      </>
                    ) : (
                      <>
                        <LockOpenIcon className="mr-1 inline h-4 w-4" />
                        <Link
                          href={`/albums/${capsule.albums[0]}`}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          View Album
                        </Link>
                      </>
                    )}
                  </p>
                </div>
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
                    className="text-lg font-medium leading-6 text-zinc-900"
                  >
                    Create Time Capsule
                  </Dialog.Title>
                  <form onSubmit={handleCreateCapsule}>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">
                          Select Album
                        </label>
                        <select
                          value={selectedAlbumId}
                          onChange={(e) => setSelectedAlbumId(e.target.value)}
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        <label className="block text-sm font-medium text-zinc-700">
                          Opening Date
                        </label>
                        <input
                          type="date"
                          value={openingDate}
                          onChange={(e) => setOpeningDate(e.target.value)}
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={openingTime}
                          onChange={(e) => setOpeningTime(e.target.value)}
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">
                          Theme
                        </label>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="classic">Classic</option>
                          <option value="vintage">Vintage</option>
                          <option value="modern">Modern</option>
                          <option value="dark">Dark</option>
                          <option value="nature">Nature</option>
                          <option value="sunset">Sunset</option>
                          <option value="ocean">Ocean</option>
                          <option value="royal">Royal</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="reminders"
                            checked={reminders}
                            onChange={(e) => setReminders(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="reminders"
                            className="ml-2 block text-sm text-zinc-700"
                          >
                            Enable Reminders
                          </label>
                        </div>
                        {reminders && (
                          <select
                            value={reminderFreq}
                            onChange={(e) => setReminderFreq(e.target.value)}
                            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="never">Never</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="passwordToggle"
                            checked={passwordToggle}
                            onChange={(e) =>
                              setPasswordToggle(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="passwordToggle"
                            className="ml-2 block text-sm text-zinc-700"
                          >
                            Password Protection
                          </label>
                        </div>
                        {passwordToggle && (
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required={passwordToggle}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
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
