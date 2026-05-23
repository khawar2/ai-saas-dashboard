import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "AI workspace",
    description: "Ship a polished assistant experience with chat, prompt history, and provider-ready API boundaries.",
  },
  {
    title: "Operational dashboard",
    description: "Track token spend, team usage, plan health, and high-level product activity in one place.",
  },
  {
    title: "Billing foundation",
    description: "Pricing cards, checkout route scaffolding, and subscription status surfaces are ready to connect.",
  },
  {
    title: "Admin controls",
    description: "Manage team roles, access policies, and account governance from a dedicated admin page.",
  },
];

const metrics = [
  { label: "Automations", value: "42K+" },
  { label: "Median response", value: "1.8s" },
  { label: "Uptime target", value: "99.9%" },
];

const pricing = [
  { name: "Free", price: "$0", description: "For exploring the platform and light AI usage.", features: ["100 messages/month", "50K tokens/month", "Community support"] },
  { name: "Pro", price: "$29", description: "For production builders with higher usage needs.", features: ["5,000 messages/month", "2M tokens/month", "Priority support"], featured: true },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-16 sm:py-24 lg:flex-row lg:items-center lg:px-8">
        <div className="max-w-3xl">
          <Badge>Production AI SaaS Starter</Badge>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Launch a premium AI SaaS in less time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Nexora AI gives you a clean frontend system for landing pages, auth,
            dashboard workflows, AI chat, billing, admin, and settings with a polished
            responsive interface.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-sky-400 px-6 py-3 text-center text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-300"
            >
              Start free trial
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-sky-300/60 hover:bg-white/10"
            >
              Explore features
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
        <Card className="relative flex-1 p-3 shadow-2xl shadow-sky-950/40 sm:p-4">
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
                <div key={feature.title} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-300" />
                  <span>
                    <span className="block text-sm font-semibold text-white">{feature.title}</span>
                    <span className="mt-1 block text-sm text-slate-400">{feature.description}</span>
                  </span>
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
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything a serious AI SaaS frontend needs"
          description="A focused set of product surfaces designed to look credible from day one and scale into real workflows."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/15 text-lg font-bold text-sky-300">
                {feature.title.charAt(0)}
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
      <section id="security" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            align="left"
            eyebrow="Built for production"
            title="Clean UX around secure product boundaries"
            description="The frontend is organized around real SaaS areas: authenticated workspace pages, protected navigation, billing entry points, admin workflows, and environment-driven integrations."
          />
          <Card className="grid gap-4 p-6 sm:grid-cols-2">
            {["Responsive layouts", "Reusable components", "Protected app shell", "Env-based secrets"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/[0.04] p-5">
                <div className="h-2 w-12 rounded-full bg-sky-300" />
                <p className="mt-5 font-semibold text-white">{item}</p>
                <p className="mt-2 text-sm text-slate-400">Designed to stay simple while supporting real SaaS implementation work.</p>
              </div>
            ))}
          </Card>
        </div>
      </section>
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans for every stage"
          description="Use these responsive pricing cards as the public billing entry point before wiring Stripe checkout."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {pricing.map((plan) => (
            <Card key={plan.name} className={plan.featured ? "p-6 ring-2 ring-sky-300/50" : "p-6"}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                {plan.featured ? <span className="rounded-full bg-sky-400 px-3 py-1 text-xs font-bold text-slate-950">Popular</span> : null}
              </div>
              <p className="mt-4 text-4xl font-semibold text-white">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-sky-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
              >
                Choose {plan.name}
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
