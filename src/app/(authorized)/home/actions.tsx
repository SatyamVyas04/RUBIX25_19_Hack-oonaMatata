"use server";
import { Pool } from '@neondatabase/serverless';
import cloudinary from "cloudinary";

export async function setAsFavoriteAction(
  publicId: string,
  isFavorite: boolean,
  userId: string
) {
  if (isFavorite) {
    await cloudinary.v2.uploader.add_tag("favorite", [publicId]);
    
    // Update database to mark as favorite
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      'UPDATE images SET is_favorite = TRUE WHERE public_id = $1 AND owner = $2',
      [publicId, userId]
    );
    await pool.end();
  } else {
    await cloudinary.v2.uploader.remove_tag("favorite", [publicId]);
    
    // Update database to remove favorite
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(
      'UPDATE images SET is_favorite = FALSE WHERE public_id = $1 AND owner = $2',
      [publicId, userId]
    );
    await pool.end();
  }
}