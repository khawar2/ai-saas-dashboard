import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function getSafeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  const safeNext = getSafeNext(next);

  return (
    <main className="grid min-h-screen lg:grid-cols-[0.9fr_1fr]">
      <section className="grid place-items-center px-6 py-12">
        <Card className="w-full max-w-md p-8">
          <Link href="/" className="text-sm font-semibold text-sky-300">Nexora AI</Link>
          <h1 className="mt-6 text-3xl font-semibold text-white">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-400">Start with a secure owner account and production-ready workspace.</p>
          <form data-testid="signup-form" action="/api/auth/register" method="post" className="mt-8 space-y-4">
            <input type="hidden" name="next" value={safeNext} />
            <Input data-testid="signup-name" name="name" placeholder="Full name" autoComplete="name" required />
            <Input data-testid="signup-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            <Input data-testid="signup-password" name="password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password" minLength={8} required />
            <Button data-testid="signup-submit" type="submit" className="w-full">Create account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-sky-300 hover:text-sky-200">Sign in</Link>
          </p>
        </Card>
      </section>
      <section className="hidden border-l border-white/10 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-sm font-black text-slate-950">N</span>
          Nexora AI
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Start building</p>
          <h2 className="mt-5 max-w-xl text-5xl font-semibold tracking-tight text-white">
            A polished SaaS interface for AI-first products.
          </h2>
          <div className="mt-8 grid gap-3">
            {["Dashboard and analytics", "AI chat workspace", "Billing and settings", "Admin controls"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">No hardcoded secrets. Clean frontend structure. Responsive by default.</p>
      </section>
    </main>
  );
}
