"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-2xl p-8 text-center">
      <p className="text-sm font-medium text-red-300">Something went wrong</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">We could not load this workspace view.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Please retry. If the issue continues, check server logs and environment configuration.
      </p>
      {error.digest ? <p className="mt-3 text-xs text-slate-600">Error digest: {error.digest}</p> : null}
      <Button type="button" onClick={reset} className="mt-6">
        Try again
      </Button>
    </Card>
  );
}
