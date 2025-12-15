"use server";

import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { desc, eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createStoryRecord(
  imageUrl: string,
  description?: string,
  takenAt?: string
) {
  try {
    // Save to Database
    await db.insert(stories).values({
      imageUrl,
      description: description || "",
      takenAt: takenAt || new Date().toISOString(), // Drizzle/Postgres handles ISO string for date
    });

    revalidatePath("/story");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error creating story record:", error);
    return { success: false, error: "Failed to create story record" };
  }
}

export async function getStories() {
  try {
    const allStories = await db
      .select()
      .from(stories)
      .orderBy(asc(stories.takenAt));
    return { success: true, data: allStories };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { success: false, error: "Failed to fetch stories" };
  }
}

export async function updateStory(id: string, description: string, takenAt: string) {
  try {
    await db
      .update(stories)
      .set({
        description,
        takenAt,
      })
      .where(eq(stories.id, id));

    revalidatePath("/story");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating story:", error);
    return { success: false, error: "Failed to update story" };
  }
}

export async function deleteStory(id: string, imageUrl: string) {
  try {
    // Delete from Database
    await db.delete(stories).where(eq(stories.id, id));

    // Delete from Vercel Blob
    // We need to handle this carefully. If the DB delete fails, we shouldn't delete the blob? 
    // Or vice versa. For now, deleting DB first. 
    // Note: del() expects the blob URL.
    await del(imageUrl);

    revalidatePath("/story");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { success: false, error: "Failed to delete story" };
  }
}
