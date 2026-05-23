import { NextResponse } from "next/server";
import { z } from "zod";

import { appConfig, requiredEnv } from "@/lib/env";

export const runtime = "nodejs";

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
});

async function readRequestBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

export async function POST(request: Request) {
  const parsed = chatSchema.safeParse(await readRequestBody(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (!appConfig.aiProviderUrl) {
    return NextResponse.json({ error: "AI provider URL is not configured." }, { status: 503 });
  }

  const providerResponse = await fetch(appConfig.aiProviderUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("AI_PROVIDER_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: appConfig.aiProviderModel,
      messages: [{ role: "user", content: parsed.data.message }],
    }),
  });

  if (!providerResponse.ok) {
    return NextResponse.json({ error: "AI provider request failed." }, { status: 502 });
  }

  return NextResponse.json(await providerResponse.json());
}
