import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Settings</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Workspace settings</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Configure profile, organization defaults, notification rules, and security preferences.</p>
      </div>
      <Card className="max-w-3xl p-6">
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
          <Button type="submit">Save settings</Button>
        </form>
      </Card>
    </section>
  );
}
