import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-security";
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME, type UserRole } from "@/lib/session";
import { logAdminActivity } from "@/models/admin-activity";
import { createDefaultSubscription } from "@/models/subscriptions";
import { countUsers, createUser, findUserByEmail } from "@/models/users";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
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

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
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

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, { key: "auth-register", limit: 5, windowMs: 60_000 });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const parsed = registerSchema.safeParse(await readRequestBody(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  }

  const isFirstUser = (await countUsers()) === 0;
  const role: UserRole = isFirstUser || getAdminEmails().has(email) ? "admin" : "user";
  const user = await createUser({
    name: parsed.data.name,
    email,
    passwordHash: await hashPassword(parsed.data.password),
    role,
  });
  const subscription = await createDefaultSubscription(user._id);

  if (role === "admin") {
    await logAdminActivity({
      actorUserId: user._id,
      actorEmail: user.email,
      action: "user.registered_admin",
      targetType: "user",
      targetId: user._id,
      metadata: { subscriptionId: String(subscription._id), isFirstUser },
    });
  }

  const response = NextResponse.redirect(getSafeRedirectUrl(request, parsed.data.next), 303);
  response.cookies.set(
    SESSION_COOKIE_NAME,
    await createSessionToken({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role,
    }),
    getSessionCookieOptions(),
  );

  return response;
}
