import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { logAdminActivity } from "@/models/admin-activity";
import { getCollections } from "@/models/collections";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { users: usersCollection } = await getCollections();
  const users = await usersCollection
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  const adminUser = await findUserById(currentUser.id);

  if (adminUser) {
    await logAdminActivity({
      actorUserId: adminUser._id,
      actorEmail: adminUser.email,
      action: "admin.users.list",
      targetType: "system",
      metadata: { resultCount: users.length },
    });
  }

  return NextResponse.json({
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      usageLimits: user.usageLimits,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),
  });
}
