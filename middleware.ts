import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/chat", "/billing", "/admin", "/settings"];

export function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get("session")?.value);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/billing/:path*", "/admin/:path*", "/settings/:path*"],
};
