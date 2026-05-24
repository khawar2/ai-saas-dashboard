import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-security";
import { createSessionToken, getSessionCookieOptions, normalizeRole, SESSION_COOKIE_NAME } from "@/lib/session";
import { logAdminActivity } from "@/models/admin-activity";
import { findUserByEmail, markUserLogin } from "@/models/users";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

async function readRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

function getSafeRedirectUrl(request: Request, next?: string) {
  const fallback = new URL("/dashboard", request.url);
  const allowedPaths = ["/dashboard", "/chat", "/documents", "/billing", "/admin", "/settings"];

  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    !allowedPaths.some((path) => next === path || next.startsWith(`${path}/`))
  ) {
    return fallback;
  }

  return new URL(next, request.url);
}

function wantsJson(request: Request) {
  return request.headers.get("accept")?.includes("application/json") ?? false;
}

function isConfigurationError(error: unknown) {
  return error instanceof Error && (
    error.message.includes("Missing required environment variable") ||
    error.message.includes("AUTH_SECRET") ||
    error.message.includes("ECONNREFUSED") ||
    error.name === "MongoServerSelectionError"
  );
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, { key: "auth-login", limit: 10, windowMs: 60_000 });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const parsed = loginSchema.safeParse(await readRequestBody(request));

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    const user = await findUserByEmail(parsed.data.email);

    if (!user || user.status !== "active" || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await markUserLogin(user._id);

    if (normalizeRole(user.role) === "admin") {
      await logAdminActivity({
        actorUserId: user._id,
        actorEmail: user.email,
        action: "admin.login",
        targetType: "user",
        targetId: user._id,
      });
    }

    const redirectUrl = getSafeRedirectUrl(request, parsed.data.next);
    const response = wantsJson(request)
      ? NextResponse.json({ redirectTo: `${redirectUrl.pathname}${redirectUrl.search}` })
      : NextResponse.redirect(redirectUrl, 303);

    response.cookies.set(
      SESSION_COOKIE_NAME,
      await createSessionToken({
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
      }),
      getSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    if (isConfigurationError(error)) {
      return NextResponse.json(
        { error: "Authentication database is not available. Start MongoDB locally or set MONGODB_URI to a MongoDB Atlas connection string, then restart the dev server." },
        { status: 503 },
      );
    }

    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now. Please try again." }, { status: 500 });
  }
}
