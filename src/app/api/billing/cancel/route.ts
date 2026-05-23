import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { getStripe } from "@/lib/stripe/server";
import { getActiveSubscription, markSubscriptionCanceling } from "@/models/subscriptions";
import { createUsageLog } from "@/models/usage";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user._id);

  if (!subscription || subscription.plan === "free") {
    return NextResponse.redirect(new URL("/billing?status=already-free", request.url), 303);
  }

  if (subscription.providerSubscriptionId) {
    await getStripe().subscriptions.update(subscription.providerSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  const updatedSubscription = await markSubscriptionCanceling(user._id);

  await createUsageLog({
    userId: user._id,
    subscriptionId: updatedSubscription?._id,
    type: "billing_event",
    metadata: { action: "subscription.cancel_at_period_end" },
  });

  return NextResponse.redirect(new URL("/billing?status=cancel-scheduled", request.url), 303);
}
