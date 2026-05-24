import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white shadow-inner shadow-slate-950/20 outline-none transition placeholder:text-slate-500 focus:border-sky-300/60 focus:ring-4 focus:ring-sky-300/10",
        className,
      )}
      {...props}
    />
  );
}
