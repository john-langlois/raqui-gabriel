import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // You can add authentication checks here
        // e.g., const session = await auth(); if (!session) throw new Error("Unauthorized");
        
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          tokenPayload: JSON.stringify({
            // optional payload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called via webhook after upload is done, 
        // BUT for simple client uploads we usually handle the DB insertion in the client's `onUploadCompleted` callback 
        // or a separate server action to ensure we have the context (description, date, etc).
        // So we can leave this empty or log it.
        console.log("Blob uploaded:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
