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

export const guestSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable(),
  status: z.enum(["pending", "attending", "declined"]).default("pending"),
  type: z.enum(["adult", "child"]).default("adult"),
  isOnWaitlist: z.boolean().default(false),
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
});

export type SearchGuestsInput = z.infer<typeof searchGuestsSchema>;
export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type BulkCreateGuestsInput = z.infer<typeof bulkCreateGuestsSchema>;
export type UpdateGuestStatusInput = z.infer<typeof updateGuestStatusSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type DeleteGuestInput = z.infer<typeof deleteGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
