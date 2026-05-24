import { cn } from "@/lib/utils";

const colors = {
  sky: "bg-gradient-to-r from-sky-400 to-cyan-300",
  emerald: "bg-gradient-to-r from-emerald-400 to-teal-300",
  amber: "bg-gradient-to-r from-amber-300 to-orange-300",
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
    <div className={cn("h-3 overflow-hidden rounded-full bg-white/10 p-0.5 shadow-inner shadow-slate-950/40", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", colors[color])} style={{ width: `${normalized}%` }} />
    </div>
  );
}
