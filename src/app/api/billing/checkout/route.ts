import { NextResponse } from "next/server";
import { z } from "zod";

import { requiredEnv } from "@/lib/env";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "scale", "enterprise"]),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid billing plan." }, { status: 400 });
  }

  const stripeSecret = requiredEnv("STRIPE_SECRET_KEY");

  return NextResponse.json({
    status: "configured",
    plan: parsed.data.plan,
    message: "Create a Stripe Checkout Session here using STRIPE_SECRET_KEY.",
    secretLoaded: Boolean(stripeSecret),
  });
}
