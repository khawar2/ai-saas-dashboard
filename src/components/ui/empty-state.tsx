import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("grid min-h-48 place-items-center p-6 text-center", className)}>
      <div>
        <p className="text-xl font-semibold text-white">{title}</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
