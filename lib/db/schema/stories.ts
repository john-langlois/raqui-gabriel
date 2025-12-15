import { pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";

export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  description: text("description").default(""),
  takenAt: date("taken_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
