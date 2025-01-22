"use client";

import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";
import { CloudinaryImage } from "@/components/cloudinary-image";
import ClientVideoPlayer from "@/components/home/ClientVideoPlayer";

export const runtime = "edge";

interface ImageData {
  public_url: string;
}

export default async function HomePage() {
  const session = await auth();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const userResult = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [session?.user?.email]
  );
  const userId = userResult.rows[0]?.id;

  const imagesResult = await pool.query(
    "SELECT public_url FROM images WHERE owner = $1",
    [userId]
  );
  const images: ImageData[] = imagesResult.rows;
  console.log(images)
  await pool.end();

  return (
    <main className="p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold text-[#eeeeee]">
          Welcome back, {session?.user?.name}!
        </h1>
        <div className="w-full p-4">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="mb-4 break-inside-avoid">
                {image.public_url.includes(`${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video`) ? (
                  <ClientVideoPlayer publicId={image.public_url.split('/upload/')[1]} />
                ) : (
                  <CloudinaryImage
                    src={image.public_url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                )}
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
      </div>
    </main>
  );
}