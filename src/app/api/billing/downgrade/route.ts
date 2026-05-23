import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { isSameOriginRequest } from "@/lib/request-security";
import { getStripe } from "@/lib/stripe/server";
import { downgradeToFree, getActiveSubscription, markSubscriptionCanceling } from "@/models/subscriptions";
import { createUsageLog } from "@/models/usage";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

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
    await downgradeToFree(user._id);
    return NextResponse.redirect(new URL("/billing?status=free", request.url), 303);
  }

  if (subscription.providerSubscriptionId) {
    await getStripe().subscriptions.update(subscription.providerSubscriptionId, {
      cancel_at_period_end: true,
    });
    await markSubscriptionCanceling(user._id);
  } else {
    await downgradeToFree(user._id);
  }

  await createUsageLog({
    userId: user._id,
    subscriptionId: subscription._id,
    type: "billing_event",
    metadata: { action: "subscription.downgrade_requested", targetPlan: "free" },
  });

  return NextResponse.redirect(new URL("/billing?status=downgrade-scheduled", request.url), 303);
}
