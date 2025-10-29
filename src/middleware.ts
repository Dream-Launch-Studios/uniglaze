import { NextResponse, type NextRequest } from "next/server";
import { APP_PATHS } from "./config/path.config";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie)
    return NextResponse.redirect(new URL(APP_PATHS.LOGIN, request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/(protected)/:path*"],
};
