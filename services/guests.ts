import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema";
import { eq, ilike, or, inArray, and } from "drizzle-orm";
import type { NewGuest } from "@/lib/db/schema/guests";

export async function getFamilyMembers(guestId: string) {
  // First, get the guest to find their familyHeadId
  const guest = await db
    .select()
    .from(guests)
    .where(eq(guests.id, guestId))
    .limit(1);

  if (guest.length === 0) {
    return [];
  }

  const familyHeadId = guest[0].familyHeadId || guest[0].id;

  // Get all family members (including the head)
  const familyMembers = await db
    .select()
    .from(guests)
    .where(
      or(eq(guests.id, familyHeadId), eq(guests.familyHeadId, familyHeadId))
    );

  return familyMembers;
}

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

  // For each result, get their family members
  const resultsWithFamilies = await Promise.all(
    results.map(async (guest) => {
      const familyMembers = await getFamilyMembers(guest.id);
      return {
        ...guest,
        familyMembers,
      };
    })
  );

  return resultsWithFamilies;
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

export async function createFamilyRsvp(
  rsvps: {
    guestId: string;
    email: string;
    phone?: string;
    status: "pending" | "attending" | "declined";
  }[]
) {
  // Update all family members with their RSVP status
  const updatedGuests = await Promise.all(
    rsvps.map(async (rsvp) => {
      const [updated] = await db
        .update(guests)
        .set({
          email: rsvp.email,
          phone: rsvp.phone || null,
          status: rsvp.status,
          updatedAt: new Date(),
        })
        .where(eq(guests.id, rsvp.guestId))
        .returning();

      return updated;
    })
  );

  return updatedGuests;
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
    familyHeadId?: string | null;
  }[];
}) {
  const newGuests: NewGuest[] = data.guests.map((g) => ({
    name: g.name,
    email: g.email || null,
    phone: g.phone || null,
    type: g.type,
    isOnWaitlist: g.isOnWaitlist,
    status: "pending",
    familyHeadId: g.familyHeadId || null,
  }));

  const created = await db.insert(guests).values(newGuests).returning();

  // If any guest was created as a family head (familyHeadId = their own id), update them
  const updated = await Promise.all(
    created.map(async (guest) => {
      if (guest.familyHeadId === guest.id) {
        return guest; // Already correct
      }
      // Check if this guest should be a family head (familyHeadId was set to their own id in the input)
      const inputGuest = data.guests.find((g) => g.name === guest.name);
      if (
        inputGuest?.familyHeadId === "self" ||
        inputGuest?.familyHeadId === guest.id
      ) {
        const [updatedGuest] = await db
          .update(guests)
          .set({ familyHeadId: guest.id, updatedAt: new Date() })
          .where(eq(guests.id, guest.id))
          .returning();
        return updatedGuest;
      }
      return guest;
    })
  );

  return updated;
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
  familyHeadId?: string | null;
}) {
  const newGuest: NewGuest = {
    name: data.name,
    type: data.type,
    isOnWaitlist: data.isOnWaitlist ?? false,
    status: "pending",
    familyHeadId: data.familyHeadId || null,
  };

  const [created] = await db.insert(guests).values(newGuest).returning();

  // If familyHeadId is "self" or should be set to own ID, update it
  if (data.familyHeadId === "self" || data.familyHeadId === created.id) {
    const [updated] = await db
      .update(guests)
      .set({ familyHeadId: created.id, updatedAt: new Date() })
      .where(eq(guests.id, created.id))
      .returning();
    return updated;
  }

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
    familyHeadId?: string | null;
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
  if (data.familyHeadId !== undefined) {
    // If familyHeadId is "self", set it to the guest's own ID
    updateData.familyHeadId =
      data.familyHeadId === "self" ? id : data.familyHeadId;
  }

  const [updated] = await db
    .update(guests)
    .set(updateData)
    .where(eq(guests.id, id))
    .returning();

  return updated;
}
