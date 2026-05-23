import { NextResponse } from "next/server";
import { z } from "zod";

import { createSessionToken, hashPassword } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
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
  const parsed = registerSchema.safeParse(await readRequestBody(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const db = await getDatabase();
  const email = parsed.data.email.toLowerCase();
  const existingUser = await db.collection("users").findOne({ email });

  if (existingUser) {
    return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  }

  const now = new Date();
  const result = await db.collection("users").insertOne({
    name: parsed.data.name,
    email,
    passwordHash: await hashPassword(parsed.data.password),
    role: "owner",
    createdAt: now,
    updatedAt: now,
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("session", createSessionToken({ userId: String(result.insertedId), role: "owner" }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
