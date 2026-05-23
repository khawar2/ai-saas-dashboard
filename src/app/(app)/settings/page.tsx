import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Settings</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">Workspace settings</h2>
        <p className="mt-3 max-w-2xl text-slate-400">Configure profile, organization defaults, notification rules, and security preferences.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <form className="space-y-5">
            <label className="block text-sm font-medium text-slate-300">
              Workspace name
              <Input className="mt-2" defaultValue="Nexora AI" />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Support email
              <Input className="mt-2" type="email" defaultValue="support@example.com" />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Default AI model
              <Input className="mt-2" defaultValue="Configured by AI_PROVIDER_MODEL" />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Monthly spend alert
              <Input className="mt-2" defaultValue="$5,000" />
            </label>
            <Button type="submit">Save settings</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {["Two-factor authentication", "Audit logging", "Weekly usage reports"].map((item) => (
            <Card key={item} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{item}</h3>
                  <p className="mt-1 text-sm text-slate-400">Recommended for production workspaces.</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">On</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
