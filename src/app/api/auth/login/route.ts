import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth";
import { createSessionToken, normalizeRole, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
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

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return new URL(next, request.url);
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readRequestBody(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const user = await findUserByEmail(parsed.data.email);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
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

  const response = NextResponse.redirect(getSafeRedirectUrl(request, parsed.data.next), 303);
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
