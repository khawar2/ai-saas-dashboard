import { getUsagePeriod } from "@/models/usage";
import { getCollections } from "@/models/collections";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  subscriptionStatus: string;
  messagesThisMonth: number;
  tokensThisMonth: number;
  createdAt: Date;
  lastLoginAt?: Date;
};

type AdminSubscriptionRow = {
  id: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: string;
  provider: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date;
};

type AdminConversationRow = {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  status: string;
  model: string;
  messageCount: number;
  lastMessageAt?: Date;
};

type AdminActivityRow = {
  id: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  createdAt: Date;
};

export type AdminDashboardData = {
  stats: {
    totalUsers: number;
    adminUsers: number;
    activeSubscriptions: number;
    monthlyMessages: number;
    monthlyTokens: number;
    recentConversations: number;
  };
  users: AdminUserRow[];
  subscriptions: AdminSubscriptionRow[];
  conversations: AdminConversationRow[];
  activity: AdminActivityRow[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { users, subscriptions, conversations, usageLogs, adminActivity } = await getCollections();
  const period = getUsagePeriod();

  const [
    totalUsers,
    adminUsers,
    activeSubscriptions,
    monthlyUsage,
    recentConversationCount,
    userRows,
    subscriptionRows,
    conversationRows,
    activityRows,
    billingActivityRows,
  ] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ role: "admin" }),
    subscriptions.countDocuments({ status: { $in: ["active", "trialing"] } }),
    usageLogs
      .aggregate<{ totalMessages: number; totalTokens: number }>([
        { $match: { period } },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: { $cond: [{ $eq: ["$type", "chat_message"] }, 1, 0] } },
            totalTokens: { $sum: "$totalTokens" },
          },
        },
      ])
      .toArray(),
    conversations.countDocuments({ status: { $ne: "deleted" } }),
    users
      .aggregate<AdminUserRow>([
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "userId",
            as: "subscription",
          },
        },
        {
          $lookup: {
            from: "usage_logs",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] },
                  period,
                },
              },
              {
                $group: {
                  _id: null,
                  messagesThisMonth: { $sum: { $cond: [{ $eq: ["$type", "chat_message"] }, 1, 0] } },
                  tokensThisMonth: { $sum: "$totalTokens" },
                },
              },
            ],
            as: "usage",
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            name: 1,
            email: 1,
            role: 1,
            status: 1,
            plan: { $ifNull: [{ $first: "$subscription.plan" }, "free"] },
            subscriptionStatus: { $ifNull: [{ $first: "$subscription.status" }, "active"] },
            messagesThisMonth: { $ifNull: [{ $first: "$usage.messagesThisMonth" }, 0] },
            tokensThisMonth: { $ifNull: [{ $first: "$usage.tokensThisMonth" }, 0] },
            createdAt: 1,
            lastLoginAt: 1,
          },
        },
      ])
      .toArray(),
    subscriptions
      .aggregate<AdminSubscriptionRow>([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 50 },
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            userName: { $ifNull: [{ $first: "$user.name" }, "Unknown user"] },
            userEmail: { $ifNull: [{ $first: "$user.email" }, "unknown@example.com"] },
            plan: 1,
            status: 1,
            provider: 1,
            cancelAtPeriodEnd: 1,
            currentPeriodEnd: 1,
          },
        },
      ])
      .toArray(),
    conversations
      .aggregate<AdminConversationRow>([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $sort: { lastMessageAt: -1, updatedAt: -1 } },
        { $limit: 50 },
        {
          $project: {
            _id: 0,
            id: { $toString: "$_id" },
            title: 1,
            status: 1,
            model: 1,
            messageCount: 1,
            lastMessageAt: 1,
            userName: { $ifNull: [{ $first: "$user.name" }, "Unknown user"] },
            userEmail: { $ifNull: [{ $first: "$user.email" }, "unknown@example.com"] },
          },
        },
      ])
      .toArray(),
    adminActivity
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    usageLogs
      .find({ type: "billing_event" })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  ]);
  const mergedActivity = [
    ...activityRows.map((activity) => ({
      id: String(activity._id),
      actorEmail: activity.actorEmail,
      action: activity.action,
      targetType: activity.targetType,
      createdAt: activity.createdAt,
    })),
    ...billingActivityRows.map((activity) => ({
      id: String(activity._id),
      actorEmail: "Stripe/System",
      action: String(activity.metadata?.action ?? "billing.event"),
      targetType: "subscription",
      createdAt: activity.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50);

  return {
    stats: {
      totalUsers,
      adminUsers,
      activeSubscriptions,
      monthlyMessages: monthlyUsage[0]?.totalMessages ?? 0,
      monthlyTokens: monthlyUsage[0]?.totalTokens ?? 0,
      recentConversations: recentConversationCount,
    },
    users: userRows,
    subscriptions: subscriptionRows,
    conversations: conversationRows,
    activity: mergedActivity,
  };
}
