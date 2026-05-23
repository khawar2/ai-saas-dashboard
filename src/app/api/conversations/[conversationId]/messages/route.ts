import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { listConversationMessages } from "@/models/conversations";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

type MessagesRouteProps = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(_request: Request, { params }: MessagesRouteProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const { conversationId } = await params;
  const history = await listConversationMessages({ userId: user._id, conversationId });

  if (!history) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({
    conversation: {
      id: String(history.conversation._id),
      title: history.conversation.title,
      status: history.conversation.status,
      model: history.conversation.model,
      messageCount: history.conversation.messageCount,
      lastMessageAt: history.conversation.lastMessageAt?.toISOString() ?? null,
      createdAt: history.conversation.createdAt.toISOString(),
      updatedAt: history.conversation.updatedAt.toISOString(),
    },
    messages: history.messages.map((message) => ({
      id: String(message._id),
      role: message.role,
      content: message.content,
      status: message.status,
      model: message.model ?? null,
      inputTokens: message.inputTokens ?? 0,
      outputTokens: message.outputTokens ?? 0,
      totalTokens: message.totalTokens ?? 0,
      error: message.error ?? null,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    })),
  });
}
