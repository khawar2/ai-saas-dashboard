import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[18rem_1fr]">
      <AppSidebar />
      <main className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
