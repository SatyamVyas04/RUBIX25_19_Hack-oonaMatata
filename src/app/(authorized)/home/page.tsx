import { auth } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [session?.user?.email]
  );
  const userId = userResult.rows[0]?.id;
  console.log(userId);
  // Second query - get images
  const imagesResult = await pool.query(
    'SELECT public_url FROM images WHERE owner = $1',
    [userId]
  );
  const images = imagesResult.rows;
  console.log(images);
  
  await pool.end();
  return (
    <main>
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-4xl font-bold text-[#eeeeee]">
          Welcome backs, {session?.user?.name}!
        </h1>
      </div>
    </main>
  );
}
