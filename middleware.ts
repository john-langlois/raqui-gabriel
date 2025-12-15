import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes are now protected by password prompt in the page component
  // No middleware needed - the page will show password prompt if not authenticated
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
