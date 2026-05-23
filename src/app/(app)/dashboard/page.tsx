import Link from "next/link";

import { StatCard } from "@/components/stat-card";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/current-user";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getActiveSubscription } from "@/models/subscriptions";
import { getUsageSummary } from "@/models/usage";
import { findUserById } from "@/models/users";

const activity = [
  { title: "AI requests increased", detail: "18% more messages than last week", tone: "text-emerald-300" },
  { title: "Billing healthy", detail: "Plan limits and renewal status are synced from Stripe", tone: "text-sky-300" },
  { title: "Admin review needed", detail: "2 invited users have not accepted", tone: "text-amber-300" },
  { title: "Provider config", detail: "AI provider route is ready for secrets", tone: "text-violet-300" },
];

export default async function DashboardPage() {
  const sessionUser = await getCurrentUser();
  const user = sessionUser ? await findUserById(sessionUser.id) : null;
  const subscription = user ? await getActiveSubscription(user._id) : null;
  const usage = user
    ? await getUsageSummary(user._id, subscription?.usageLimits ?? user.usageLimits)
    : null;
  const planName = subscription?.plan ?? "free";
  const tokenPercent = usage?.percentages.tokens ?? 0;
  const messagePercent = usage?.percentages.messages ?? 0;

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-400/20 via-white/[0.06] to-transparent p-6 sm:p-8">
          <p className="text-sm font-medium text-sky-300">Workspace overview</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Good morning, {sessionUser?.name ?? "there"}.
          </h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Monitor usage, remaining credits, plan limits, billing health, and AI activity from one clean surface.
          </p>
        </div>
        <Card className="p-6">
          <p className="text-sm text-slate-400">Current plan</p>
          <p className="mt-3 text-3xl font-semibold capitalize text-white">{planName}</p>
          <Progress value={tokenPercent} className="mt-5 h-2" />
          <p className="mt-3 text-sm text-slate-400">
            {formatNumber(usage?.monthly.totalTokens ?? 0)} of {formatNumber(usage?.limits.monthlyTokens ?? 0)} monthly tokens used
          </p>
        </Card>
      </div>
      {usage?.limitReached ? (
        <Alert variant="warning" className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-100">Plan limit reached</p>
              <p className="mt-1 text-sm text-amber-100/80">
                Upgrade your plan to continue sending AI messages this month.
              </p>
            </div>
            <Link href="/billing" className="rounded-full bg-amber-200 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-100">
              Upgrade plan
            </Link>
          </div>
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Messages this month"
          value={formatNumber(usage?.monthly.totalMessages ?? 0)}
          detail={`${formatNumber(usage?.remaining.messages ?? 0)} remaining`}
        />
        <StatCard
          label="Messages today"
          value={formatNumber(usage?.daily.totalMessages ?? 0)}
          detail="Daily usage from chat requests"
        />
        <StatCard
          label="Tokens this month"
          value={formatNumber(usage?.monthly.totalTokens ?? 0)}
          detail={`${formatNumber(usage?.remaining.tokens ?? 0)} tokens remaining`}
        />
        <StatCard
          label="Estimated AI cost"
          value={formatCurrency(usage?.monthly.totalCostUsd ?? 0)}
          detail="Tracked when provider cost is available"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Plan limits</h2>
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Monthly messages</span>
                <span className="text-slate-400">{messagePercent}% used</span>
              </div>
              <Progress value={messagePercent} className="mt-3" />
              <p className="mt-2 text-sm text-slate-500">
                {formatNumber(usage?.monthly.totalMessages ?? 0)} / {formatNumber(usage?.limits.monthlyMessages ?? 0)} messages
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Monthly tokens</span>
                <span className="text-slate-400">{tokenPercent}% used</span>
              </div>
              <Progress value={tokenPercent} color="emerald" className="mt-3" />
              <p className="mt-2 text-sm text-slate-500">
                {formatNumber(usage?.monthly.totalTokens ?? 0)} / {formatNumber(usage?.limits.monthlyTokens ?? 0)} tokens
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Usage summary</h2>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Remaining credits",
                detail: `${formatNumber(usage?.remaining.credits ?? 0)} messages available this month`,
                tone: "text-emerald-300",
              },
              {
                title: "Daily usage",
                detail: `${formatNumber(usage?.daily.totalMessages ?? 0)} messages and ${formatNumber(usage?.daily.totalTokens ?? 0)} tokens today`,
                tone: "text-sky-300",
              },
              ...activity.slice(1, 3),
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white/[0.04] p-4">
                <p className={`text-sm font-semibold ${item.tone}`}>{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white">Operational readiness</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["Environment secrets", "MongoDB connection", "Billing routes", "Admin access policy"].map((item) => (
            <div key={item} className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">{item}</div>
          ))}
        </div>
      </Card>
    </section>
  );
}
