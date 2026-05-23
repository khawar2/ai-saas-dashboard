import { NextRequest, NextResponse } from "next/server";

import { readSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const protectedRoutes = ["/dashboard", "/chat", "/documents", "/billing", "/admin", "/settings"];
const authRoutes = ["/login", "/register", "/signup"];

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function getSafeRedirectPath(pathname: string) {
  const isProtectedPath = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  return pathname.startsWith("/") && !pathname.startsWith("//") && isProtectedPath ? pathname : "/dashboard";
}

export async function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isAuthRoute && session) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (!isProtectedRoute) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", getSafeRedirectPath(request.nextUrl.pathname));
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "admin") {
    return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/documents/:path*",
    "/billing/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/signup",
  ],
};
