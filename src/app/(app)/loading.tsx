import { Card } from "@/components/ui/card";

export default function AppLoading() {
  return (
    <section className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded-full bg-white/10" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Card key={item} className="h-32 animate-pulse bg-white/[0.04]" />
        ))}
      </div>
      <Card className="h-96 animate-pulse bg-white/[0.04]" />
    </section>
  );
}
