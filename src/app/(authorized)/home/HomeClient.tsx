"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { CloudinaryImage } from "@/components/cloudinary-image";
import ClientVideoPlayer from "@/components/home/ClientVideoPlayer";
import CreateAlbumDialog from "@/components/home/CreateAlbumDialog";
import { DatePickerDemo } from "@/components/date-picker";

interface ImageData {
  public_url: string;
  date: string; // Keep this as a string because database dates are often strings
}

interface HomeClientProps {
  initialImages: ImageData[];
  userName: string;
}

export default function HomeClient({ initialImages, userName }: HomeClientProps) {
  const [images] = useState<ImageData[]>(initialImages); // Original images
  const [filteredImages, setFilteredImages] = useState<ImageData[]>(initialImages); // Filtered images
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date); // Update the selected date
    const filtered = images.filter(
      (image) => new Date(image.date).toDateString() === date.toDateString()
    );
    setFilteredImages(filtered); // Update filtered images
    console.log("Filtered Images:", filtered);
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  return (
    <main className="p-2">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="mx-2 text-2xl font-bold text-foreground">
            {userName}'s Photos
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <DatePickerDemo onDateSelect={handleDateSelect} />
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
          <div className="columns-1 gap-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
            {filteredImages.map((image, index) => (
              <BlurFade key={image.public_url} delay={0.25 + index * 0.05} inView>
                <div className="mb-2 break-inside-avoid">
                  <div
                    className={`group relative cursor-pointer ${
                      isSelectionMode ? "hover:opacity-90" : ""
                    }`}
                    onClick={() =>
                      isSelectionMode && toggleImageSelection(image.public_url)
                    }
                  >
                    {image.public_url.includes("/video") ? (
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

          {filteredImages.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg">No photos found for the selected date.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
