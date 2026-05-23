import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDatabase();
  const users = await db
    .collection("users")
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ users });
}
