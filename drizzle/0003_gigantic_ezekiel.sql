ALTER TABLE "guests" RENAME COLUMN "attending" TO "status";--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "guests" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
UPDATE "guests" SET "status" = 'pending' WHERE "status" IS NULL OR "status" = 'false' OR "status" = 'true';--> statement-breakpoint
UPDATE "guests" SET "status" = 'attending' WHERE "status" = 'true';