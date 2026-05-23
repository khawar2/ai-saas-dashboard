import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function getSafeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const safeNext = getSafeNext(next);

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden border-r border-white/10 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-sm font-black text-slate-950">N</span>
          Nexora AI
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Welcome back</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-tight text-white">
            Manage your AI product from one polished workspace.
          </h1>
          <p className="mt-5 max-w-lg text-slate-400">
            Sign in to review usage, team access, billing, AI conversations, and workspace settings.
          </p>
        </div>
        <p className="text-sm text-slate-500">Secure access. Production-ready structure. Premium SaaS UX.</p>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <Card className="w-full max-w-md p-8">
          <Link href="/" className="text-sm font-semibold text-sky-300">Nexora AI</Link>
          <h1 className="mt-6 text-3xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-400">Use your workspace account to continue.</p>
          <form data-testid="login-form" action="/api/auth/login" method="post" className="mt-8 space-y-4">
            <input type="hidden" name="next" value={safeNext} />
            <Input data-testid="login-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            <Input data-testid="login-password" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
            <Button data-testid="login-submit" type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-6 flex justify-between text-sm text-slate-400">
            <Link href="/forgot-password" className="hover:text-white">Forgot password?</Link>
            <Link href="/signup" className="hover:text-white">Create account</Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
