import type { SubscriptionPlan, UsageLimits } from "@/models/types";

export type BillingPlan = {
  id: SubscriptionPlan;
  name: string;
  price: string;
  description: string;
  stripePriceEnv?: "STRIPE_PRO_PRICE_ID";
  usageLimits: UsageLimits;
  features: string[];
};

export const BILLING_PLANS: Record<SubscriptionPlan, BillingPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    description: "For testing the platform and light AI usage.",
    usageLimits: { monthlyMessages: 100, monthlyTokens: 50_000 },
    features: ["100 AI messages/month", "50K tokens/month", "Community support"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$29",
    description: "For production builders who need higher limits.",
    stripePriceEnv: "STRIPE_PRO_PRICE_ID",
    usageLimits: { monthlyMessages: 5_000, monthlyTokens: 2_000_000 },
    features: ["5,000 AI messages/month", "2M tokens/month", "Priority support"],
  },
};

export function getBillingPlan(plan: SubscriptionPlan) {
  return BILLING_PLANS[plan];
}

export function getPlanFromStripePrice(priceId?: string | null): SubscriptionPlan {
  if (priceId && priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return "pro";
  }

  return "free";
}
