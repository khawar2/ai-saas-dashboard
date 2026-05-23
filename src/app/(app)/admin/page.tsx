import { Card } from "@/components/ui/card";

const rows = [
  { name: "Khawar Saeed", role: "Owner", status: "Active" },
  { name: "Ava Patel", role: "Admin", status: "Invited" },
  { name: "Noah Chen", role: "Member", status: "Active" },
];

export default function AdminPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Admin</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Team and access control</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Manage users, roles, workspace policies, and audit-sensitive operations.</p>
      </div>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-300">
          <span>User</span><span>Role</span><span>Status</span>
        </div>
        {rows.map((row) => (
          <div key={row.name} className="grid grid-cols-3 border-b border-white/10 p-4 text-sm text-slate-300 last:border-0">
            <span className="font-medium text-white">{row.name}</span><span>{row.role}</span><span>{row.status}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}
