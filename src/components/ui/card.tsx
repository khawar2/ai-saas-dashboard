import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-3xl border border-white/10 bg-white/[0.06] shadow-xl shadow-slate-950/20", className)}
      {...props}
    />
  );
}
