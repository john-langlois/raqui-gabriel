import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { eq, ilike, or, inArray } from "drizzle-orm";
import type { NewGuest } from "@/lib/db/schema/guests";

export async function searchGuests(query: string) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  // Search across name, email, and phone fields with partial matching
  const results = await db
    .select()
    .from(guests)
    .where(
      or(
        ilike(guests.name, searchTerm),
        ilike(guests.email, searchTerm),
        ilike(guests.phone, searchTerm)
      )
    )
    .limit(10);

  return results;
}

export async function createRsvp(data: {
  name: string;
  email: string;
  phone?: string;
  status: "pending" | "attending" | "declined";
}) {
  // Check if guest already exists
  const existing = await db
    .select()
    .from(guests)
    .where(eq(guests.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    // Update existing guest
    const [updated] = await db
      .update(guests)
      .set({
        name: data.name,
        phone: data.phone || null,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(guests.email, data.email))
      .returning();

    return updated;
  }

  // Create new guest
  const newGuest: NewGuest = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    status: data.status,
    type: "adult",
    isOnWaitlist: false,
  };

  const [created] = await db.insert(guests).values(newGuest).returning();
  return created;
}

export async function getAllGuests() {
  const results = await db.select().from(guests).orderBy(guests.createdAt);

  return results;
}

export async function bulkCreateGuests(data: {
  guests: {
    name: string;
    email?: string;
    phone?: string;
    type: "adult" | "child";
    isOnWaitlist: boolean;
  }[];
}) {
  const newGuests: NewGuest[] = data.guests.map((g) => ({
    name: g.name,
    email: g.email || null,
    phone: g.phone || null,
    type: g.type,
    isOnWaitlist: g.isOnWaitlist,
    status: "pending",
  }));

  const created = await db.insert(guests).values(newGuests).returning();

  return created;
}

import { sql } from "drizzle-orm"; // Need to import sql

export async function updateGuestStatus(
  guestIds: string[],
  isOnWaitlist: boolean
) {
  const updated = await db
    .update(guests)
    .set({
      isOnWaitlist,
      updatedAt: new Date(),
    })
    .where(inArray(guests.id, guestIds))
    .returning();

  return updated;
}

export async function createGuest(data: {
  name: string;
  type: "adult" | "child";
  isOnWaitlist?: boolean;
}) {
  const newGuest: NewGuest = {
    name: data.name,
    type: data.type,
    isOnWaitlist: data.isOnWaitlist ?? false,
    status: "pending",
  };

  const [created] = await db.insert(guests).values(newGuest).returning();
  return created;
}

export async function deleteGuest(id: string) {
  await db.delete(guests).where(eq(guests.id, id));
  return { success: true };
}

export async function updateGuest(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: "pending" | "attending" | "declined";
    type?: "adult" | "child";
    isOnWaitlist?: boolean;
  }
) {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.isOnWaitlist !== undefined)
    updateData.isOnWaitlist = data.isOnWaitlist;

  const [updated] = await db
    .update(guests)
    .set(updateData)
    .where(eq(guests.id, id))
    .returning();

  return updated;
}
