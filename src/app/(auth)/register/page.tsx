import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="text-sm font-semibold text-sky-300">Nexora AI</Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Create your workspace</h1>
        <p className="mt-2 text-sm text-slate-400">Start with a secure account and a default owner workspace.</p>
        <form action="/api/auth/register" method="post" className="mt-8 space-y-4">
          <Input name="name" placeholder="Full name" autoComplete="name" required />
          <Input name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
          <Input name="password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password" minLength={8} required />
          <Button type="submit" className="w-full">Create account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-sky-300 hover:text-sky-200">Sign in</Link>
        </p>
      </Card>
    </main>
  );
}
