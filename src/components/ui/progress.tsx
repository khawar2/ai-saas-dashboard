import { cn } from "@/lib/utils";

const colors = {
  sky: "bg-sky-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-300",
};

export function Progress({
  value,
  color = "sky",
  className,
}: {
  value: number;
  color?: keyof typeof colors;
  className?: string;
}) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-white/10", className)}>
      <div className={cn("h-full rounded-full transition-all", colors[color])} style={{ width: `${normalized}%` }} />
    </div>
  );
}
