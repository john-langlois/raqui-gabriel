import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import type { NextRequest } from "next/server";
import guests from "./routes/guests";

const app = new Hono()
  .basePath("/api")
  .use(
    "*",
    cors({
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    })
  )
  .route("/guests", guests);

export type AppType = typeof app;

async function handler(request: NextRequest) {
  try {
    const res = await app.fetch(request);
    return res;
  } catch (err) {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    // Handle validation errors and other errors
    console.error("API Error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
