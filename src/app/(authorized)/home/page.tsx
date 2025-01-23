import { auth } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";
import HomeClient from "./HomeClient";

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
  await pool.end();

  return (
    <HomeClient 
      initialImages={images} 
      userName={session?.user?.name || ""}
    />
  );
}