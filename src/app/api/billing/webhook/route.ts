import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { requiredEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";
import {
  downgradeToFree,
  findSubscriptionByStripeCustomer,
  findSubscriptionByStripeSubscription,
  setStripeCustomer,
  syncStripeSubscription,
} from "@/models/subscriptions";
import { createUsageLog } from "@/models/usage";

export const runtime = "nodejs";

async function logBillingEvent(input: {
  userId?: string;
  subscriptionId?: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  if (!input.userId || !ObjectId.isValid(input.userId)) {
    return;
  }

  await createUsageLog({
    userId: new ObjectId(input.userId),
    subscriptionId: input.subscriptionId && ObjectId.isValid(input.subscriptionId) ? new ObjectId(input.subscriptionId) : undefined,
    type: "billing_event",
    metadata: {
      action: input.action,
      ...input.metadata,
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = typeof session.customer === "string" ? session.customer : undefined;

  if (userId && ObjectId.isValid(userId) && customerId) {
    await setStripeCustomer(new ObjectId(userId), customerId);
  }

  if (typeof session.subscription === "string") {
    const subscription = await getStripe().subscriptions.retrieve(session.subscription);
    const storedSubscription = await syncStripeSubscription(subscription);

    await logBillingEvent({
      userId,
      subscriptionId: storedSubscription ? String(storedSubscription._id) : undefined,
      action: "checkout.completed",
      metadata: { stripeCheckoutSessionId: session.id },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const existingSubscription = await findSubscriptionByStripeSubscription(subscription.id);
  const resolvedUserId = userId ?? (existingSubscription ? String(existingSubscription.userId) : undefined);

  if (resolvedUserId && ObjectId.isValid(resolvedUserId)) {
    const downgraded = await downgradeToFree(new ObjectId(resolvedUserId));
    await logBillingEvent({
      userId: resolvedUserId,
      subscriptionId: downgraded ? String(downgraded._id) : undefined,
      action: "subscription.deleted",
      metadata: { stripeSubscriptionId: subscription.id },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const storedSubscription = await syncStripeSubscription(subscription);

  await logBillingEvent({
    userId: subscription.metadata.userId ?? (storedSubscription ? String(storedSubscription.userId) : undefined),
    subscriptionId: storedSubscription ? String(storedSubscription._id) : undefined,
    action: `subscription.${subscription.status}`,
    metadata: {
      stripeSubscriptionId: subscription.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : undefined;
  const storedSubscription = customerId ? await findSubscriptionByStripeCustomer(customerId) : null;

  await logBillingEvent({
    userId: storedSubscription ? String(storedSubscription.userId) : undefined,
    subscriptionId: storedSubscription ? String(storedSubscription._id) : undefined,
    action: "invoice.payment_failed",
    metadata: { stripeInvoiceId: invoice.id },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, requiredEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
