import { NextResponse } from "next/server";
import { z } from "zod";

import { createSessionToken, verifyPassword } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function readRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readRequestBody(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const db = await getDatabase();
  const user = await db.collection("users").findOne<{ _id: object; passwordHash: string; role?: "owner" | "admin" | "member" }>({
    email: parsed.data.email.toLowerCase(),
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("session", createSessionToken({ userId: String(user._id), role: user.role ?? "member" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
