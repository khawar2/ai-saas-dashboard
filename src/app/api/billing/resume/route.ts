import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { getStripe } from "@/lib/stripe/server";
import { getActiveSubscription, markSubscriptionActive } from "@/models/subscriptions";
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

  if (!subscription?.providerSubscriptionId) {
    return NextResponse.redirect(new URL("/billing?status=no-paid-subscription", request.url), 303);
  }

  await getStripe().subscriptions.update(subscription.providerSubscriptionId, {
    cancel_at_period_end: false,
  });
  const updatedSubscription = await markSubscriptionActive(user._id);

  await createUsageLog({
    userId: user._id,
    subscriptionId: updatedSubscription?._id,
    type: "billing_event",
    metadata: { action: "subscription.resume_requested" },
  });

  return NextResponse.redirect(new URL("/billing?status=subscription-resumed", request.url), 303);
}
