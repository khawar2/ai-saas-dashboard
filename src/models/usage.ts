import type { ObjectId } from "mongodb";

import { getCollections } from "@/models/collections";
import type { UsageLogDocument, UsageLogType } from "@/models/types";

type UsageTotals = {
  totalMessages: number;
  totalTokens: number;
  totalCostUsd: number;
};

export function getUsagePeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getUtcDayRange(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function emptyUsage(): UsageTotals {
  return { totalMessages: 0, totalTokens: 0, totalCostUsd: 0 };
}

export async function getMonthlyUsage(userId: ObjectId, period = getUsagePeriod()) {
  const { usageLogs } = await getCollections();
  const [usage] = await usageLogs
    .aggregate<UsageTotals>([
      { $match: { userId, period } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: { $cond: [{ $eq: ["$type", "chat_message"] }, 1, 0] } },
          totalTokens: { $sum: "$totalTokens" },
          totalCostUsd: { $sum: "$costUsd" },
        },
      },
    ])
    .toArray();

  return usage ?? emptyUsage();
}

export async function getDailyUsage(userId: ObjectId, date = new Date()) {
  const { start, end } = getUtcDayRange(date);
  const { usageLogs } = await getCollections();
  const [usage] = await usageLogs
    .aggregate<UsageTotals>([
      {
        $match: {
          userId,
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: { $cond: [{ $eq: ["$type", "chat_message"] }, 1, 0] } },
          totalTokens: { $sum: "$totalTokens" },
          totalCostUsd: { $sum: "$costUsd" },
        },
      },
    ])
    .toArray();

  return usage ?? emptyUsage();
}

export function getUsagePercent(used: number, limit: number) {
  if (limit <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

export async function getUsageSummary(
  userId: ObjectId,
  limits: { monthlyMessages: number; monthlyTokens: number },
) {
  const [daily, monthly] = await Promise.all([getDailyUsage(userId), getMonthlyUsage(userId)]);
  const remainingMessages = Math.max(0, limits.monthlyMessages - monthly.totalMessages);
  const remainingTokens = Math.max(0, limits.monthlyTokens - monthly.totalTokens);
  const limitReached = remainingMessages <= 0 || remainingTokens <= 0;

  return {
    daily,
    monthly,
    limits,
    remaining: {
      messages: remainingMessages,
      tokens: remainingTokens,
      credits: remainingMessages,
    },
    percentages: {
      messages: getUsagePercent(monthly.totalMessages, limits.monthlyMessages),
      tokens: getUsagePercent(monthly.totalTokens, limits.monthlyTokens),
    },
    limitReached,
  };
}

export async function createUsageLog(input: {
  userId: ObjectId;
  type: UsageLogType;
  conversationId?: ObjectId;
  messageId?: ObjectId;
  subscriptionId?: ObjectId;
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd?: number;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date();
  const log: Omit<UsageLogDocument, "_id"> = {
    userId: input.userId,
    type: input.type,
    conversationId: input.conversationId,
    messageId: input.messageId,
    subscriptionId: input.subscriptionId,
    provider: input.provider,
    model: input.model,
    inputTokens: input.inputTokens ?? 0,
    outputTokens: input.outputTokens ?? 0,
    totalTokens: input.totalTokens ?? 0,
    costUsd: input.costUsd ?? 0,
    period: getUsagePeriod(now),
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };
  const { usageLogs } = await getCollections();
  const result = await usageLogs.insertOne(log as UsageLogDocument);

  return { ...log, _id: result.insertedId };
}

export async function assertWithinUsageLimits(userId: ObjectId, limits: { monthlyMessages: number; monthlyTokens: number }) {
  const summary = await getUsageSummary(userId, limits);

  if (summary.monthly.totalMessages >= limits.monthlyMessages) {
    return {
      ok: false as const,
      reason: "You have reached your monthly message limit. Upgrade your plan to continue chatting.",
      summary,
    };
  }

  if (summary.monthly.totalTokens >= limits.monthlyTokens) {
    return {
      ok: false as const,
      reason: "You have reached your monthly token limit. Upgrade your plan to continue chatting.",
      summary,
    };
  }

  return { ok: true as const, summary };
}
