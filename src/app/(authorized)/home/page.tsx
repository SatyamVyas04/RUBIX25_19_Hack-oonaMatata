import { auth } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { CloudinaryImage } from "@/components/cloudinary-image";

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Get user ID
  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [session?.user?.email]
  );
  const userId = userResult.rows[0]?.id;

  // Get images
  const imagesResult = await pool.query(
    'SELECT public_url FROM images WHERE owner = $1',
    [userId]
  );
  const images = imagesResult.rows;
  
  await pool.end();

  return (
    <main className="p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold text-[#eeeeee]">
          Welcome back, {session?.user?.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg">
              <CloudinaryImage
                src={image.public_url}
                alt={`Image ${index + 1}`}
                className="group-hover:scale-105 group-hover:opacity-75"
              />
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
    </main>
  );
}
