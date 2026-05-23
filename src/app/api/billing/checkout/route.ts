import { NextResponse } from "next/server";
import { z } from "zod";

import { appConfig, requiredEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/current-user";
import { isSameOriginRequest } from "@/lib/request-security";
import { getStripe } from "@/lib/stripe/server";
import { getActiveSubscription, setStripeCustomer } from "@/models/subscriptions";
import { createUsageLog } from "@/models/usage";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  plan: z.enum(["pro"]),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid billing plan." }, { status: 400 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const stripe = getStripe();
  const priceId = appConfig.stripeProPriceId ?? requiredEnv("STRIPE_PRO_PRICE_ID");
  const subscription = await getActiveSubscription(user._id);
  let customerId = subscription?.providerCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: String(user._id),
      },
    });
    customerId = customer.id;
    await setStripeCustomer(user._id, customerId);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appConfig.appUrl}/billing?checkout=success`,
    cancel_url: `${appConfig.appUrl}/billing?checkout=cancelled`,
    subscription_data: {
      metadata: {
        userId: String(user._id),
        plan: parsed.data.plan,
      },
    },
    metadata: {
      userId: String(user._id),
      plan: parsed.data.plan,
    },
  });

  await createUsageLog({
    userId: user._id,
    subscriptionId: subscription?._id,
    type: "billing_event",
    metadata: {
      action: "checkout.requested",
      plan: parsed.data.plan,
      stripeCheckoutSessionId: checkoutSession.id,
    },
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 502 });
  }

  return NextResponse.redirect(checkoutSession.url, 303);
}
