import type { Collection } from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import type {
  AdminActivityDocument,
  ConversationDocument,
  MessageDocument,
  SubscriptionDocument,
  UsageLogDocument,
  UserDocument,
} from "@/models/types";

type AppCollections = {
  users: Collection<UserDocument>;
  conversations: Collection<ConversationDocument>;
  messages: Collection<MessageDocument>;
  subscriptions: Collection<SubscriptionDocument>;
  usageLogs: Collection<UsageLogDocument>;
  adminActivity: Collection<AdminActivityDocument>;
};

let indexesReady: Promise<void> | null = null;

async function ensureIndexes(collections: AppCollections) {
  await Promise.all([
    collections.users.createIndex({ email: 1 }, { unique: true }),
    collections.users.createIndex({ role: 1, status: 1 }),

    collections.conversations.createIndex({ userId: 1, updatedAt: -1 }),
    collections.conversations.createIndex({ userId: 1, status: 1, lastMessageAt: -1 }),

    collections.messages.createIndex({ conversationId: 1, createdAt: 1 }),
    collections.messages.createIndex({ userId: 1, createdAt: -1 }),

    collections.subscriptions.createIndex({ userId: 1 }, { unique: true }),
    collections.subscriptions.createIndex({ status: 1, currentPeriodEnd: 1 }),
    collections.subscriptions.createIndex({ providerCustomerId: 1 }, { sparse: true }),
    collections.subscriptions.createIndex({ providerSubscriptionId: 1 }, { sparse: true }),

    collections.usageLogs.createIndex({ userId: 1, period: 1, type: 1 }),
    collections.usageLogs.createIndex({ conversationId: 1, createdAt: -1 }, { sparse: true }),
    collections.usageLogs.createIndex({ createdAt: -1 }),

    collections.adminActivity.createIndex({ createdAt: -1 }),
    collections.adminActivity.createIndex({ actorUserId: 1, createdAt: -1 }, { sparse: true }),
    collections.adminActivity.createIndex({ targetType: 1, targetId: 1, createdAt: -1 }, { sparse: true }),
  ]);
}

export async function getCollections() {
  const db = await getDatabase();
  const collections: AppCollections = {
    users: db.collection<UserDocument>("users"),
    conversations: db.collection<ConversationDocument>("conversations"),
    messages: db.collection<MessageDocument>("messages"),
    subscriptions: db.collection<SubscriptionDocument>("subscriptions"),
    usageLogs: db.collection<UsageLogDocument>("usage_logs"),
    adminActivity: db.collection<AdminActivityDocument>("admin_activity"),
  };

  indexesReady ??= ensureIndexes(collections);
  await indexesReady;

  return collections;
}
