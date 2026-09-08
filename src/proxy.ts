import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Look up user by session ID using shared prisma singleton
  try {
    const user = await withRetry(() =>
      prisma.user.findUnique({
        where: { sessionId: sessionToken },
        select: { role: true },
      })
    );

    if (!user || user.role !== "admin") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "admin_only");
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy database error:", error);
    // On DB error, allow the request through — the page will handle auth
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
