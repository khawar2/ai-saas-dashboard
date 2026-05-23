"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "AI Chat" },
  { href: "/billing", label: "Billing" },
  { href: "/admin", label: "Admin" },
  { href: "/settings", label: "Settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-white/10 bg-slate-950/80 p-4 lg:w-72">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 text-lg font-semibold text-white">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-sm font-black text-slate-950">
          N
        </span>
        Nexora AI
      </Link>
      <nav className="space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                active && "bg-sky-400 text-slate-950 hover:bg-sky-400 hover:text-slate-950",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
        <p className="font-medium text-white">Production checklist</p>
        <p className="mt-2 text-slate-400">Set env secrets, connect billing webhooks, and enforce role policies.</p>
      </div>
    </aside>
  );
}
