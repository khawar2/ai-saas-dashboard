import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const features = [
  "Secure multi-tenant workspace foundation",
  "AI chat route ready for provider integration",
  "Billing and admin surfaces designed for growth",
  "MongoDB-backed backend logic in route handlers",
];

const metrics = [
  { label: "Automations", value: "42K+" },
  { label: "Median response", value: "1.8s" },
  { label: "Uptime target", value: "99.9%" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-20 sm:py-28 lg:flex-row lg:items-center lg:px-8">
        <div className="max-w-3xl">
          <Badge>Production AI SaaS Starter</Badge>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            Launch an AI product with the right foundation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Nexora AI gives teams a clean SaaS platform structure with authentication,
            dashboards, billing, admin workflows, settings, and secure backend entry points.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-sky-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-300"
            >
              Start building
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-sky-300/60 hover:bg-white/10"
            >
              View dashboard
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">{metric.value}</div>
                <div className="mt-1 text-sm text-slate-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
        <Card className="relative flex-1 p-4 shadow-2xl shadow-sky-950/40">
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Workspace</p>
                <h2 className="text-xl font-semibold text-white">AI Operations</h2>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Live
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-300" />
                  <span className="text-sm text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-sky-400 p-5 text-slate-950">
              <p className="text-sm font-medium">Next action</p>
              <p className="mt-2 text-2xl font-semibold">Connect your AI provider and billing secrets.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
