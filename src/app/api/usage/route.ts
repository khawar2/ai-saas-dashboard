import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { getActiveSubscription } from "@/models/subscriptions";
import { getUsageSummary } from "@/models/usage";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user._id);
  const summary = await getUsageSummary(user._id, subscription?.usageLimits ?? user.usageLimits);

  return NextResponse.json({
    plan: subscription?.plan ?? "free",
    subscriptionStatus: subscription?.status ?? "trialing",
    ...summary,
  });
}
