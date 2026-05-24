import { redirect } from "next/navigation";

import { AppSidebar, MobileAppNav } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { AuthProvider } from "@/components/auth-provider";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider user={user}>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[18rem_1fr]">
        <div className="pointer-events-none absolute inset-0 premium-grid opacity-40" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
        <AppSidebar user={user} />
        <div className="relative min-w-0 pb-24 lg:pb-0">
          <AppTopbar user={user} />
          <main className="px-5 py-6 sm:px-8 lg:px-10">{children}</main>
        </div>
        <MobileAppNav user={user} />
      </div>
    </AuthProvider>
  );
}
