import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, type UserRole } from "@/lib/session";
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

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return new URL(next, request.url);
}

export async function POST(request: Request) {
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
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
