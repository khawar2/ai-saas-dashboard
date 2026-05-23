"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/chat", label: "AI Chat", icon: "C" },
  { href: "/documents", label: "Documents", icon: "F" },
  { href: "/billing", label: "Billing", icon: "B" },
  { href: "/admin", label: "Admin", icon: "A", adminOnly: true },
  { href: "/settings", label: "Settings", icon: "S" },
];

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => !item.adminOnly || user.role === "admin");

  return (
    <aside className="hidden min-h-screen w-full flex-col border-r border-white/10 bg-slate-950/90 p-4 lg:flex lg:w-72">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 text-lg font-semibold text-white">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-sm font-black text-slate-950">
          N
        </span>
        Nexora AI
      </Link>
      <nav className="space-y-1">
        {visibleNavigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                active && "bg-sky-400 text-slate-950 shadow-lg shadow-sky-950/30 hover:bg-sky-400 hover:text-slate-950",
              )}
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-xs", active && "bg-slate-950/10")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
        <p className="font-medium text-white">{user.name}</p>
        <p className="mt-1 truncate text-slate-400">{user.email}</p>
        <p className="mt-3 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-sky-200">
          {user.role}
        </p>
      </div>
    </aside>
  );
}

export function MobileAppNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => !item.adminOnly || user.role === "admin");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {visibleNavigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "min-w-20 flex-1 rounded-2xl px-2 py-2 text-center text-[11px] font-medium text-slate-400 transition hover:text-white",
                active && "bg-sky-400 text-slate-950 hover:text-slate-950",
              )}
            >
              <span className="block text-sm font-bold">{item.icon}</span>
              {item.label.replace("AI ", "")}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
