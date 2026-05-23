import { NextResponse } from "next/server";

import { isSameOriginRequest } from "@/lib/request-security";
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  response.cookies.set(SESSION_COOKIE_NAME, "", getSessionCookieOptions(0));

  return response;
}
