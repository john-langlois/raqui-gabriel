import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  searchGuestsSchema,
  createRsvpSchema,
  createFamilyRsvpSchema,
  bulkCreateGuestsSchema,
  updateGuestStatusSchema,
  createGuestSchema,
  deleteGuestSchema,
  updateGuestSchema,
} from "@/features/guests/api/schemas";
import {
  searchGuests,
  createRsvp,
  createFamilyRsvp,
  getAllGuests,
  bulkCreateGuests,
  updateGuestStatus,
  createGuest,
  deleteGuest,
  updateGuest,
} from "@/services/guests";

const guests = new Hono()
  // Search guests
  .get("/search", zValidator("query", searchGuestsSchema), async (c) => {
    const { q } = c.req.valid("query");
    const results = await searchGuests(q);
    return c.json({ success: true, data: results });
  })
  // Create RSVP
  .post("/rsvp", zValidator("json", createRsvpSchema), async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await createRsvp(data);
      return c.json({ success: true, data: result }, 201);
    } catch (error: any) {
      if (error.code === "23505") {
        return c.json({ success: false, error: "Email already exists" }, 400);
      }
      return c.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create RSVP",
        },
        500
      );
    }
  })
  // Create Family RSVP
  .post(
    "/rsvp/family",
    zValidator("json", createFamilyRsvpSchema),
    async (c) => {
      const data = c.req.valid("json");
      try {
        const result = await createFamilyRsvp(data.rsvps);
        return c.json({ success: true, data: result }, 201);
      } catch (error: any) {
        return c.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create family RSVP",
          },
          500
        );
      }
    }
  )
  // Create Single Guest (Admin)
  .post("/", zValidator("json", createGuestSchema), async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await createGuest(data);
      return c.json({ success: true, data: result }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  })
  // Delete Guest (Admin)
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await deleteGuest(id);
      return c.json({ success: true });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  })
  // Bulk Create Guests (Admin)
  .post("/bulk", zValidator("json", bulkCreateGuestsSchema), async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await bulkCreateGuests(data);
      return c.json({ success: true, data: result }, 201);
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  })
  // Update Guest Status (Admin)
  .patch("/status", zValidator("json", updateGuestStatusSchema), async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await updateGuestStatus(data.guestIds, data.isOnWaitlist);
      return c.json({ success: true, data: result });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  })
  // Update Guest (Admin)
  .patch("/:id", zValidator("json", updateGuestSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    // Remove id from data if present, use URL param instead
    const { id: _, ...updateData } = data;
    try {
      const result = await updateGuest(id, updateData);
      return c.json({ success: true, data: result });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  })
  // Get all guests (admin only)
  .get("/", async (c) => {
    const req = c.req.raw;
    const cookies = req.headers.get("cookie") || "";
    const isAuthenticated = cookies.includes("admin-authenticated=true");

    if (!isAuthenticated) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const results = await getAllGuests();
    return c.json({ success: true, data: results });
  });

export default guests;
