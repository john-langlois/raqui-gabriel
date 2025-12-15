CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"description" text NOT NULL,
	"taken_at" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
