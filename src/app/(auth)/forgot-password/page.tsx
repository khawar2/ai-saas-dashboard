import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="text-sm font-semibold text-sky-300">Nexora AI</Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your email and connect a transactional email provider in production.</p>
        <form className="mt-8 space-y-4">
          <Input name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
        <Link href="/login" className="mt-6 block text-center text-sm text-sky-300 hover:text-sky-200">Back to login</Link>
      </Card>
    </main>
  );
}
