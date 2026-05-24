import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-slate-900/60 shadow-2xl shadow-slate-950/25 backdrop-blur-xl ring-1 ring-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}
