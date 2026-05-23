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
      <div className="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[18rem_1fr]">
        <AppSidebar user={user} />
        <div className="min-w-0 pb-24 lg:pb-0">
          <AppTopbar user={user} />
          <main className="px-5 py-6 sm:px-8 lg:px-10">{children}</main>
        </div>
        <MobileAppNav user={user} />
      </div>
    </AuthProvider>
  );
}
