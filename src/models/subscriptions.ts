import { ObjectId } from "mongodb";
import Stripe from "stripe";

import { getBillingPlan, getPlanFromStripePrice } from "@/lib/billing/plans";
import { getCollections } from "@/models/collections";
import type { SubscriptionDocument, SubscriptionPlan, SubscriptionStatus, UsageLimits } from "@/models/types";

const PLAN_LIMITS: Record<SubscriptionPlan, UsageLimits> = {
  free: getBillingPlan("free").usageLimits,
  pro: getBillingPlan("pro").usageLimits,
};

export function getPlanLimits(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan];
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function createDefaultSubscription(userId: ObjectId) {
  const now = new Date();
  const subscription: Omit<SubscriptionDocument, "_id"> = {
    userId,
    plan: "free",
    status: "active",
    provider: "manual",
    currentPeriodStart: now,
    currentPeriodEnd: addMonths(now, 1),
    cancelAtPeriodEnd: false,
    usageLimits: getPlanLimits("free"),
    createdAt: now,
    updatedAt: now,
  };
  const { subscriptions } = await getCollections();
  const result = await subscriptions.insertOne(subscription as SubscriptionDocument);

  return { ...subscription, _id: result.insertedId };
}

export async function getActiveSubscription(userId: ObjectId) {
  const { subscriptions } = await getCollections();

  return subscriptions.findOne({ userId });
}

export async function upsertSubscriptionPlan(
  userId: ObjectId,
  plan: SubscriptionPlan,
  input?: {
    status?: SubscriptionStatus;
    providerCustomerId?: string;
    providerSubscriptionId?: string;
    providerPriceId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  },
) {
  const now = new Date();
  const { subscriptions } = await getCollections();

  await subscriptions.updateOne(
    { userId },
    {
      $set: {
        plan,
        status: input?.status ?? (plan === "free" ? "active" : "incomplete"),
        provider: plan === "free" ? "manual" : "stripe",
        providerCustomerId: input?.providerCustomerId,
        providerSubscriptionId: input?.providerSubscriptionId,
        providerPriceId: input?.providerPriceId,
        usageLimits: getPlanLimits(plan),
        currentPeriodStart: input?.currentPeriodStart ?? now,
        currentPeriodEnd: input?.currentPeriodEnd ?? addMonths(now, 1),
        cancelAtPeriodEnd: input?.cancelAtPeriodEnd ?? false,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return subscriptions.findOne({ userId });
}

export async function setStripeCustomer(userId: ObjectId, customerId: string) {
  const now = new Date();
  const { subscriptions } = await getCollections();

  await subscriptions.updateOne(
    { userId },
    {
      $set: {
        providerCustomerId: customerId,
        updatedAt: now,
      },
      $setOnInsert: {
        plan: "free",
        status: "active",
        provider: "manual",
        currentPeriodStart: now,
        currentPeriodEnd: addMonths(now, 1),
        cancelAtPeriodEnd: false,
        usageLimits: getPlanLimits("free"),
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

function stripeDate(seconds?: number | null) {
  return seconds ? new Date(seconds * 1000) : new Date();
}

function normalizeStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "incomplete") {
    return status;
  }

  return "canceled";
}

export async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    return null;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromStripePrice(priceId);
  const subscriptionWithPeriods = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  return upsertSubscriptionPlan(new ObjectId(userId), plan, {
    status: normalizeStripeStatus(subscription.status),
    providerCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    providerSubscriptionId: subscription.id,
    providerPriceId: priceId,
    currentPeriodStart: stripeDate(subscriptionWithPeriods.current_period_start),
    currentPeriodEnd: stripeDate(subscriptionWithPeriods.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

export async function downgradeToFree(userId: ObjectId) {
  return upsertSubscriptionPlan(userId, "free", {
    status: "active",
    providerSubscriptionId: undefined,
    providerPriceId: undefined,
    cancelAtPeriodEnd: false,
  });
}

export async function markSubscriptionCanceling(userId: ObjectId) {
  const now = new Date();
  const { subscriptions } = await getCollections();

  await subscriptions.updateOne(
    { userId },
    {
      $set: {
        cancelAtPeriodEnd: true,
        updatedAt: now,
      },
    },
  );

  return subscriptions.findOne({ userId });
}

export async function markSubscriptionActive(userId: ObjectId) {
  const now = new Date();
  const { subscriptions } = await getCollections();

  await subscriptions.updateOne(
    { userId },
    {
      $set: {
        cancelAtPeriodEnd: false,
        updatedAt: now,
      },
    },
  );

  return subscriptions.findOne({ userId });
}

export async function findSubscriptionByStripeCustomer(customerId: string) {
  const { subscriptions } = await getCollections();

  return subscriptions.findOne({ providerCustomerId: customerId });
}

export async function findSubscriptionByStripeSubscription(subscriptionId: string) {
  const { subscriptions } = await getCollections();

  return subscriptions.findOne({ providerSubscriptionId: subscriptionId });
}
