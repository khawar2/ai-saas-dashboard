import { NextRequest, NextResponse } from "next/server";

import { readSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const protectedRoutes = ["/dashboard", "/chat", "/documents", "/billing", "/admin", "/settings"];
const authRoutes = ["/login", "/register", "/signup"];

function getSafeRedirectPath(pathname: string) {
  return pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
}

export async function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const session = await readSessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", getSafeRedirectPath(request.nextUrl.pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
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
