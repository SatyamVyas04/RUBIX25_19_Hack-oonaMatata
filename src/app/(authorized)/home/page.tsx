import { auth } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { CloudinaryImage } from "@/components/cloudinary-image";
import CloudinaryImageUploader from "@/components/home/uploader";

export const runtime = "edge";

export default async function HomePage({
  searchParams = { search: "" },
}: {
  searchParams?: { search?: string };
}) {
  const session = await auth();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Get user ID
  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [session?.user?.email]
  );
  const userId = userResult.rows[0]?.id;

  // Get images with search if provided
  const searchTerm = searchParams.search;
  const imagesResult = await pool.query(
    searchTerm
      ? 'SELECT public_url FROM images WHERE owner = $1 AND public_url ILIKE $2'
      : 'SELECT public_url FROM images WHERE owner = $1',
    searchTerm ? [userId, `%${searchTerm}%`] : [userId]
  );
  const images = imagesResult.rows;
  
  await pool.end();

  return (
    <main className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-[#eeeeee]">
            Welcome back, {session?.user?.name}!
          </h1>
        </div>

        {/* Simple Search Form */}
        <form action="/" className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Search images..."
              className="flex-1 px-4 py-2 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] text-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

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
              {searchTerm 
                ? "No photos found matching your search." 
                : "No photos uploaded yet."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}