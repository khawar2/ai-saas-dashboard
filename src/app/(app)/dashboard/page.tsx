import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";

const activity = [
  "Workspace created and secured",
  "AI chat route waiting for provider secret",
  "Billing checkout route configured for Stripe secret",
  "Admin policy surface ready for role checks",
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Workspace overview</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Monitor usage, billing status, AI activity, and operational readiness from one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly messages" value="18,240" detail="Across all workspaces" />
        <StatCard label="Active users" value="1,284" detail="12% growth this month" />
        <StatCard label="Token spend" value="$3,812" detail="Provider costs estimate" />
        <StatCard label="Plan" value="Scale" detail="Renews in 18 days" />
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white">Operational readiness</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {activity.map((item) => (
            <div key={item} className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">{item}</div>
          ))}
        </div>
      </Card>
    </section>
  );
}
