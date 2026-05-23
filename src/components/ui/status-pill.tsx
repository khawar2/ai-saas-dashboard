import { cn } from "@/lib/utils";

export function StatusPill({
  children,
  className,
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-sky-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
