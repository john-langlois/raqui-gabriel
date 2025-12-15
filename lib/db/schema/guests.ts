import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("pending"), // 'pending', 'attending', 'declined'
  type: text("type").notNull().default("adult"), // 'adult' or 'child'
  isOnWaitlist: boolean("is_on_waitlist").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
