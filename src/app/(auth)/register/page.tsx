import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/auth-forms";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/current-user";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function getSafeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;
  const safeNext = getSafeNext(next);

  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[0.9fr_1fr]">
      <div className="pointer-events-none absolute inset-0 premium-grid opacity-40" />
      <section className="relative grid place-items-center px-6 py-12">
        <Card className="w-full max-w-md p-8">
          <Link href="/" className="text-sm font-semibold text-sky-300">Nexora AI</Link>
          <h1 className="mt-6 text-3xl font-semibold text-white">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-400">Start with a secure owner account and production-ready workspace.</p>
          <SignupForm nextPath={safeNext} />
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-sky-300 hover:text-sky-200">Sign in</Link>
          </p>
        </Card>
      </section>
      <section className="relative hidden border-l border-white/10 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-emerald-300 text-sm font-black text-slate-950">N</span>
          Nexora AI
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Start building</p>
          <h2 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-0.05em] text-white">
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
