"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  nextPath: string;
};

async function readAuthResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json() as Promise<{ error?: string; redirectTo?: string }>;
  }

  return { error: response.ok ? undefined : "Authentication failed. Please try again." };
}

export function LoginForm({ nextPath }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("next", nextPath);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await readAuthResponse(response);

      if (!response.ok || data.error) {
        setError(data.error ?? "Invalid credentials.");
        return;
      }

      router.push(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form data-testid="login-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Input data-testid="login-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
      <Input data-testid="login-password" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      <Button data-testid="login-submit" type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export function SignupForm({ nextPath }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("next", nextPath);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const data = await readAuthResponse(response);

      if (!response.ok || data.error) {
        setError(data.error ?? "Unable to create account.");
        return;
      }

      router.push(data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Unable to create account right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form data-testid="signup-form" onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Input data-testid="signup-name" name="name" placeholder="Full name" autoComplete="name" required />
      <Input data-testid="signup-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
      <Input
        data-testid="signup-password"
        name="password"
        type="password"
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Button data-testid="signup-submit" type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
