import type { ObjectId } from "mongodb";

import type { UserRole } from "@/lib/session";

export type TimestampedDocument = {
  createdAt: Date;
  updatedAt: Date;
};

export type UserStatus = "active" | "invited" | "suspended";

export type UsageLimits = {
  monthlyMessages: number;
  monthlyTokens: number;
};

export type UserDocument = TimestampedDocument & {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  usageLimits: UsageLimits;
};

export type ConversationStatus = "active" | "archived" | "deleted";

export type ConversationDocument = TimestampedDocument & {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  status: ConversationStatus;
  model: string;
  messageCount: number;
  lastMessageAt?: Date;
  metadata?: Record<string, unknown>;
};

export type MessageRole = "system" | "user" | "assistant";
export type MessageStatus = "pending" | "completed" | "failed";

export type MessageDocument = TimestampedDocument & {
  _id: ObjectId;
  conversationId: ObjectId;
  userId: ObjectId;
  role: MessageRole;
  content: string;
  model?: string;
  status: MessageStatus;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  providerMessageId?: string;
  error?: string;
};

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type SubscriptionPlan = "free" | "pro";

export type SubscriptionDocument = TimestampedDocument & {
  _id: ObjectId;
  userId: ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: "stripe" | "manual";
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  providerPriceId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  usageLimits: UsageLimits;
};

export type UsageLogType = "chat_message" | "chat_completion" | "billing_event";

export type UsageLogDocument = TimestampedDocument & {
  _id: ObjectId;
  userId: ObjectId;
  conversationId?: ObjectId;
  messageId?: ObjectId;
  subscriptionId?: ObjectId;
  type: UsageLogType;
  provider?: string;
  model?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  period: string;
  metadata?: Record<string, unknown>;
};

export type UploadedDocumentStatus = "ready" | "processing" | "failed";

export type UploadedDocumentDocument = TimestampedDocument & {
  _id: ObjectId;
  userId: ObjectId;
  originalName: string;
  storedName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  status: UploadedDocumentStatus;
  extractedText: string;
  textPreview: string;
  pageCount?: number;
  error?: string;
};

export type AdminActivityDocument = TimestampedDocument & {
  _id: ObjectId;
  actorUserId?: ObjectId;
  actorEmail?: string;
  action: string;
  targetType: "user" | "subscription" | "conversation" | "system";
  targetId?: ObjectId;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};
