import Stripe from "stripe";

import { requiredEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  stripeClient ??= new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-04-22.dahlia",
    appInfo: {
      name: "Nexora AI SaaS",
      version: "0.1.0",
    },
  });

  return stripeClient;
}
