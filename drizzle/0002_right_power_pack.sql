ALTER TABLE "stories" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "stories" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stories" ALTER COLUMN "taken_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "type" text DEFAULT 'adult' NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "is_on_waitlist" boolean DEFAULT false NOT NULL;