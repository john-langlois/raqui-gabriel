import { z } from "zod";

export const searchGuestsSchema = z.object({
  q: z.string().min(1, "Search query is required"),
});

export const createRsvpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  status: z.enum(["pending", "attending", "declined"]).default("attending"),
});

export const createFamilyRsvpSchema = z.object({
  rsvps: z
    .array(
      z.object({
        guestId: z.string().uuid(),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        status: z.enum(["pending", "attending", "declined"]),
      })
    )
    .min(1, "At least one RSVP is required"),
});

export const guestSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable(),
  status: z.enum(["pending", "attending", "declined"]).default("pending"),
  type: z.enum(["adult", "child"]).default("adult"),
  isOnWaitlist: z.boolean().default(false),
  familyHeadId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const bulkCreateGuestsSchema = z.object({
  guests: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      type: z.enum(["adult", "child"]).default("adult"),
      isOnWaitlist: z.boolean().default(false),
      familyHeadId: z.string().uuid().nullable().optional(),
    })
  ),
});

export const updateGuestStatusSchema = z.object({
  guestIds: z.array(z.string()),
  isOnWaitlist: z.boolean(),
});

export const createGuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["adult", "child"]).default("adult"),
  isOnWaitlist: z.boolean().default(false),
  familyHeadId: z.string().uuid().nullable().optional(),
});

export const deleteGuestSchema = z.object({
  id: z.string().uuid(),
});

export const updateGuestSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(["pending", "attending", "declined"]).optional(),
  type: z.enum(["adult", "child"]).optional(),
  isOnWaitlist: z.boolean().optional(),
  familyHeadId: z.string().uuid().nullable().optional(),
});

export type SearchGuestsInput = z.infer<typeof searchGuestsSchema>;
export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;
export type CreateFamilyRsvpInput = z.infer<typeof createFamilyRsvpSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type BulkCreateGuestsInput = z.infer<typeof bulkCreateGuestsSchema>;
export type UpdateGuestStatusInput = z.infer<typeof updateGuestStatusSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type DeleteGuestInput = z.infer<typeof deleteGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
