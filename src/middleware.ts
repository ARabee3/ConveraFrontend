import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("convera_token")?.value;
  const role = request.cookies.get("convera_role")?.value;

  // Protected routes that require auth
  const authRequired = ["/bookings", "/host", "/admin"];
  const needsAuth = authRequired.some((route) => pathname.startsWith(route));

  if (needsAuth && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based protection
  if (pathname.startsWith("/host") && token) {
    if (role !== "HOST" && role !== "ADMIN" && role !== "SYSTEM_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/admin") && token) {
    if (role !== "SYSTEM_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bookings/:path*", "/host/:path*", "/admin/:path*"],
};
