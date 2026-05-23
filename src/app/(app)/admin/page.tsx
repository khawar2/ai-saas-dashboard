import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { formatDate, formatNumber } from "@/lib/format";
import { getAdminDashboardData } from "@/models/admin-dashboard";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Admin</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">Platform control center</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Monitor users, subscriptions, AI usage, recent conversations, and system activity from one protected admin workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Total users", formatNumber(data.stats.totalUsers)],
          ["Admins", formatNumber(data.stats.adminUsers)],
          ["Active subs", formatNumber(data.stats.activeSubscriptions)],
          ["Monthly messages", formatNumber(data.stats.monthlyMessages)],
          ["Monthly tokens", formatNumber(data.stats.monthlyTokens)],
          ["Conversations", formatNumber(data.stats.recentConversations)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h3 className="text-xl font-semibold text-white">Users and usage</h3>
          <p className="mt-1 text-sm text-slate-400">Latest 50 users with subscription and monthly usage context.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.8fr_0.9fr_1fr] border-b border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-300">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Plan</span>
            <span>Messages</span>
            <span>Tokens</span>
            <span>Last login</span>
          </div>
          {data.users.map((row) => (
            <div key={row.id} className="grid min-w-[980px] grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.8fr_0.9fr_1fr] items-center border-b border-white/10 p-4 text-sm text-slate-300 last:border-0">
              <span>
                <span className="block font-medium text-white">{row.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{row.email}</span>
              </span>
              <StatusPill>{row.role}</StatusPill>
              <StatusPill>{row.status}</StatusPill>
              <span className="capitalize">{row.plan} · {row.subscriptionStatus}</span>
              <span>{formatNumber(row.messagesThisMonth)}</span>
              <span>{formatNumber(row.tokensThisMonth)}</span>
              <span>{formatDate(row.lastLoginAt, "Never")}</span>
            </div>
          ))}
          {data.users.length === 0 ? <EmptyState title="No users found" description="New users will appear here after signup." /> : null}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h3 className="text-xl font-semibold text-white">Subscriptions</h3>
            <p className="mt-1 text-sm text-slate-400">Billing status across Free and Pro plans.</p>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[1.6fr_0.8fr_0.9fr_0.8fr_1fr] border-b border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-300">
              <span>Customer</span>
              <span>Plan</span>
              <span>Status</span>
              <span>Provider</span>
              <span>Period end</span>
            </div>
            {data.subscriptions.map((subscription) => (
              <div key={subscription.id} className="grid min-w-[760px] grid-cols-[1.6fr_0.8fr_0.9fr_0.8fr_1fr] items-center border-b border-white/10 p-4 text-sm text-slate-300 last:border-0">
                <span>
                  <span className="block font-medium text-white">{subscription.userName}</span>
                  <span className="mt-1 block text-xs text-slate-500">{subscription.userEmail}</span>
                </span>
                <span className="capitalize">{subscription.plan}</span>
                <StatusPill>{subscription.cancelAtPeriodEnd ? "canceling" : subscription.status}</StatusPill>
                <span className="capitalize">{subscription.provider}</span>
                <span>{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            ))}
            {data.subscriptions.length === 0 ? <EmptyState title="No subscriptions found" description="Subscription records are created during signup or checkout." /> : null}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h3 className="text-xl font-semibold text-white">Recent conversations</h3>
            <p className="mt-1 text-sm text-slate-400">Latest AI conversations for support and monitoring.</p>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-[1.6fr_1.2fr_0.8fr_0.7fr_1fr] border-b border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-300">
              <span>Conversation</span>
              <span>User</span>
              <span>Model</span>
              <span>Messages</span>
              <span>Last message</span>
            </div>
            {data.conversations.map((conversation) => (
              <div key={conversation.id} className="grid min-w-[760px] grid-cols-[1.6fr_1.2fr_0.8fr_0.7fr_1fr] items-center border-b border-white/10 p-4 text-sm text-slate-300 last:border-0">
                <span>
                  <span className="block truncate font-medium text-white">{conversation.title}</span>
                  <span className="mt-1 block text-xs capitalize text-slate-500">{conversation.status}</span>
                </span>
                <span>
                  <span className="block">{conversation.userName}</span>
                  <span className="mt-1 block text-xs text-slate-500">{conversation.userEmail}</span>
                </span>
                <span>{conversation.model}</span>
                <span>{formatNumber(conversation.messageCount)}</span>
                <span>{formatDate(conversation.lastMessageAt, "Never")}</span>
              </div>
            ))}
            {data.conversations.length === 0 ? <EmptyState title="No conversations found" description="AI chat conversations will appear here after users send messages." /> : null}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h3 className="text-xl font-semibold text-white">System activity</h3>
          <p className="mt-1 text-sm text-slate-400">Recent admin and billing events captured for audit review.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-[1.4fr_1.4fr_1fr_1fr] border-b border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-300">
            <span>Action</span>
            <span>Actor</span>
            <span>Target</span>
            <span>Time</span>
          </div>
          {data.activity.map((activity) => (
            <div key={activity.id} className="grid min-w-[720px] grid-cols-[1.4fr_1.4fr_1fr_1fr] border-b border-white/10 p-4 text-sm text-slate-300 last:border-0">
              <span className="font-medium text-white">{activity.action}</span>
              <span>{activity.actorEmail ?? "System"}</span>
              <span className="capitalize">{activity.targetType}</span>
              <span>{formatDate(activity.createdAt)}</span>
            </div>
          ))}
          {data.activity.length === 0 ? <EmptyState title="No system activity found" description="Admin and billing events will appear here for audit review." /> : null}
        </div>
      </Card>
    </section>
  );
}
