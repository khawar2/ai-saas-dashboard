"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SessionUser } from "@/lib/session";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "AI Chat",
  "/documents": "Documents",
  "/billing": "Billing",
  "/admin": "Admin",
  "/settings": "Settings",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppTopbar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Workspace";

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Nexora AI
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-300/60 hover:bg-white/10"
          >
            New chat
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-300/60 hover:bg-red-500/10 hover:text-red-100">
              Logout
            </button>
          </form>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-sm font-bold text-slate-950">
            {initials(user.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
