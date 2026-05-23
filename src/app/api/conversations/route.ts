import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { listUserConversations } from "@/models/conversations";
import { findUserById } from "@/models/users";

export const runtime = "nodejs";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const user = await findUserById(currentUser.id);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const conversations = await listUserConversations(user._id);

  return NextResponse.json({
    conversations: conversations.map((conversation) => ({
      id: String(conversation._id),
      title: conversation.title,
      status: conversation.status,
      model: conversation.model,
      messageCount: conversation.messageCount,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    })),
  });
}
