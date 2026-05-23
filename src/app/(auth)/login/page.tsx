import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="text-sm font-semibold text-sky-300">Nexora AI</Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to manage your workspace and AI usage.</p>
        <form action="/api/auth/login" method="post" className="mt-8 space-y-4">
          <Input name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
          <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <div className="mt-6 flex justify-between text-sm text-slate-400">
          <Link href="/forgot-password" className="hover:text-white">Forgot password?</Link>
          <Link href="/register" className="hover:text-white">Create account</Link>
        </div>
      </Card>
    </main>
  );
}
