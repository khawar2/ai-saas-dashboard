import { ObjectId } from "mongodb";

import { appConfig } from "@/lib/env";
import { getCollections } from "@/models/collections";
import type { ConversationDocument, MessageDocument, MessageRole, MessageStatus } from "@/models/types";

function createTitle(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ");
  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized || "New conversation";
}

export async function getOrCreateConversation(input: {
  userId: ObjectId;
  conversationId?: string;
  firstMessage: string;
}) {
  const { conversations } = await getCollections();

  if (input.conversationId && ObjectId.isValid(input.conversationId)) {
    const existing = await conversations.findOne({
      _id: new ObjectId(input.conversationId),
      userId: input.userId,
      status: { $ne: "deleted" },
    });

    if (existing) {
      return existing;
    }
  }

  const now = new Date();
  const conversation: Omit<ConversationDocument, "_id"> = {
    userId: input.userId,
    title: createTitle(input.firstMessage),
    status: "active",
    model: appConfig.aiProviderModel,
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await conversations.insertOne(conversation as ConversationDocument);

  return { ...conversation, _id: result.insertedId };
}

export async function createMessage(input: {
  conversationId: ObjectId;
  userId: ObjectId;
  role: MessageRole;
  content: string;
  status?: MessageStatus;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  providerMessageId?: string;
  error?: string;
}) {
  const now = new Date();
  const message: Omit<MessageDocument, "_id"> = {
    conversationId: input.conversationId,
    userId: input.userId,
    role: input.role,
    content: input.content,
    status: input.status ?? "completed",
    model: input.model,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    providerMessageId: input.providerMessageId,
    error: input.error,
    createdAt: now,
    updatedAt: now,
  };
  const { messages } = await getCollections();
  const result = await messages.insertOne(message as MessageDocument);

  return { ...message, _id: result.insertedId };
}

export async function touchConversation(conversationId: ObjectId, messageIncrement = 1) {
  const now = new Date();
  const { conversations } = await getCollections();

  await conversations.updateOne(
    { _id: conversationId },
    {
      $inc: { messageCount: messageIncrement },
      $set: {
        lastMessageAt: now,
        updatedAt: now,
      },
    },
  );
}

export async function listUserConversations(userId: ObjectId) {
  const { conversations } = await getCollections();

  return conversations
    .find({ userId, status: { $ne: "deleted" } })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(50)
    .toArray();
}

export async function listConversationMessages(input: { userId: ObjectId; conversationId: string }) {
  if (!ObjectId.isValid(input.conversationId)) {
    return null;
  }

  const conversationId = new ObjectId(input.conversationId);
  const { conversations, messages } = await getCollections();
  const conversation = await conversations.findOne({
    _id: conversationId,
    userId: input.userId,
    status: { $ne: "deleted" },
  });

  if (!conversation) {
    return null;
  }

  const conversationMessages = await messages
    .find({ conversationId, userId: input.userId })
    .sort({ createdAt: 1 })
    .toArray();

  return { conversation, messages: conversationMessages };
}

export async function listRecentMessagesForConversation(input: {
  userId: ObjectId;
  conversationId: ObjectId;
  limit?: number;
}) {
  const { messages } = await getCollections();
  const recentMessages = await messages
    .find({ conversationId: input.conversationId, userId: input.userId, status: "completed" })
    .sort({ createdAt: -1 })
    .limit(input.limit ?? 20)
    .toArray();

  return recentMessages.reverse();
}
