import { cn } from "@/lib/utils";

const variants = {
  info: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  warning: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  error: "border-red-400/20 bg-red-500/10 text-red-100",
  success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
};

export function Alert({
  variant = "info",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <div
      className={cn("rounded-2xl border px-4 py-3 text-sm", variants[variant], className)}
      {...props}
    />
  );
}
