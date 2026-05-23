import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { BILLING_PLANS } from "@/lib/billing/plans";
import { formatDate, formatNumber } from "@/lib/format";
import { getActiveSubscription } from "@/models/subscriptions";
import { getUsageSummary } from "@/models/usage";
import { findUserById } from "@/models/users";

export default async function BillingPage() {
  const sessionUser = await getCurrentUser();
  const user = sessionUser ? await findUserById(sessionUser.id) : null;
  const subscription = user ? await getActiveSubscription(user._id) : null;
  const currentPlan = subscription?.plan ?? "free";
  const usage = user
    ? await getUsageSummary(user._id, subscription?.usageLimits ?? user.usageLimits)
    : null;
  const plans = [BILLING_PLANS.free, BILLING_PLANS.pro];

  return (
    <section className="space-y-8">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-300">Billing</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">Plans and subscription</h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Manage your Stripe subscription, plan limits, cancellation status, and usage allowance.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-400 p-5 text-slate-950">
            <p className="text-sm font-medium">Current plan</p>
            <p className="mt-2 text-3xl font-semibold capitalize">{currentPlan}</p>
            <p className="mt-2 text-sm">
              {subscription?.cancelAtPeriodEnd
                ? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
                : `Renews on ${formatDate(subscription?.currentPeriodEnd)}`}
            </p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.id === currentPlan ? "p-6 ring-2 ring-sky-300/50" : "p-6"}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
              {plan.id === currentPlan ? <StatusPill className="bg-sky-400 text-slate-950">Current</StatusPill> : null}
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{plan.price}</p>
            <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-sky-300" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.id === "pro" && currentPlan !== "pro" ? (
              <form action="/api/billing/checkout" method="post" className="mt-6">
                <input type="hidden" name="plan" value="pro" />
                <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100">
                  Upgrade to Pro
                </button>
              </form>
            ) : null}
            {plan.id === "free" && currentPlan !== "free" ? (
              <form action="/api/billing/downgrade" method="post" className="mt-6">
                <button className="w-full rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Downgrade to Free
                </button>
              </form>
            ) : null}
            {plan.id === currentPlan ? (
              <button disabled className="mt-6 w-full rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-slate-400">
                Active plan
              </button>
            ) : null}
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Billing status</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Subscription status</p>
              <p className="mt-2 font-semibold capitalize text-white">{subscription?.status ?? "active"}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Provider</p>
              <p className="mt-2 font-semibold capitalize text-white">{subscription?.provider ?? "manual"}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Messages remaining</p>
              <p className="mt-2 font-semibold text-white">{formatNumber(usage?.remaining.messages ?? 0)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Tokens remaining</p>
              <p className="mt-2 font-semibold text-white">{formatNumber(usage?.remaining.tokens ?? 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white">Subscription actions</h2>
          <div className="mt-5 space-y-3">
            {currentPlan === "pro" && subscription?.cancelAtPeriodEnd ? (
              <form action="/api/billing/resume" method="post">
                <button className="w-full rounded-full bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  Resume subscription
                </button>
              </form>
            ) : null}
            {currentPlan === "pro" && !subscription?.cancelAtPeriodEnd ? (
              <form action="/api/billing/cancel" method="post">
                <button className="w-full rounded-full border border-red-300/30 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/10">
                  Cancel subscription
                </button>
              </form>
            ) : null}
            <p className="text-sm text-slate-400">
              Cancellation and downgrades are scheduled for the end of the billing period so users keep paid access they already purchased.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
