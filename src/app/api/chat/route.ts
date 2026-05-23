import { NextResponse } from "next/server";
import { z } from "zod";

import { getAiProvider } from "@/lib/ai/provider";
import { getCurrentUser } from "@/lib/current-user";
import { checkRateLimit } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-security";
import {
  createMessage,
  getOrCreateConversation,
  listRecentMessagesForConversation,
  touchConversation,
} from "@/models/conversations";
import { getActiveSubscription } from "@/models/subscriptions";
import { assertWithinUsageLimits, createUsageLog } from "@/models/usage";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
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
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, { key: "chat", limit: 30, windowMs: 60_000 });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many chat requests. Please slow down and try again." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = chatSchema.safeParse(await readRequestBody(request));

  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const subscription = await getActiveSubscription(user._id);
  const limitCheck = await assertWithinUsageLimits(user._id, subscription?.usageLimits ?? user.usageLimits);

  if (!limitCheck.ok) {
    return NextResponse.json(
      {
        error: limitCheck.reason,
        code: "PLAN_LIMIT_REACHED",
        upgradeHref: "/billing",
        usage: limitCheck.summary,
      },
      { status: 429 },
    );
  }

  const conversation = await getOrCreateConversation({
    userId: user._id,
    conversationId: parsed.data.conversationId,
    firstMessage: parsed.data.message,
  });
  const history = await listRecentMessagesForConversation({
    userId: user._id,
    conversationId: conversation._id,
    limit: 20,
  });
  const userMessage = await createMessage({
    conversationId: conversation._id,
    userId: user._id,
    role: "user",
    content: parsed.data.message,
  });
  await createUsageLog({
    userId: user._id,
    conversationId: conversation._id,
    messageId: userMessage._id,
    subscriptionId: subscription?._id,
    type: "chat_message",
  });

  try {
    const provider = getAiProvider();
    const aiResponse = await provider.createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI SaaS assistant. Be concise, practical, and clear. When discussing business or technical topics, provide actionable next steps.",
        },
        ...history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user", content: parsed.data.message },
      ],
    });
    const assistantMessage = await createMessage({
      conversationId: conversation._id,
      userId: user._id,
      role: "assistant",
      content: aiResponse.content,
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      totalTokens: aiResponse.totalTokens,
      providerMessageId: aiResponse.providerMessageId,
    });
    await createUsageLog({
      userId: user._id,
      conversationId: conversation._id,
      messageId: assistantMessage._id,
      subscriptionId: subscription?._id,
      type: "chat_completion",
      provider: aiResponse.provider,
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      totalTokens: aiResponse.totalTokens,
    });
    await touchConversation(conversation._id, 2);

    return NextResponse.json({
      conversationId: String(conversation._id),
      message: {
        id: String(assistantMessage._id),
        role: assistantMessage.role,
        content: assistantMessage.content,
        status: assistantMessage.status,
        model: assistantMessage.model,
        createdAt: assistantMessage.createdAt.toISOString(),
      },
      usage: {
        inputTokens: aiResponse.inputTokens,
        outputTokens: aiResponse.outputTokens,
        totalTokens: aiResponse.totalTokens,
      },
    });
  } catch (error) {
    const internalMessage = error instanceof Error ? error.message : "AI provider request failed.";
    const publicMessage = "AI provider request failed. Please try again.";
    await createMessage({
      conversationId: conversation._id,
      userId: user._id,
      role: "assistant",
      content: publicMessage,
      status: "failed",
      error: internalMessage,
    });
    await touchConversation(conversation._id, 2);

    return NextResponse.json({ error: publicMessage }, { status: 502 });
  }
}
