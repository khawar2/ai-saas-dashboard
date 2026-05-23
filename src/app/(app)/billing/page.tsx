import { Card } from "@/components/ui/card";

const plans = [
  { name: "Starter", price: "$29", features: ["5 seats", "50K tokens", "Email support"] },
  { name: "Scale", price: "$149", features: ["Unlimited seats", "2M tokens", "Priority support"] },
  { name: "Enterprise", price: "Custom", features: ["SAML SSO", "Custom limits", "Dedicated success"] },
];

export default function BillingPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Billing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Plans and subscription</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Connect Stripe secrets and webhooks before enabling checkout in production.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-4 text-4xl font-semibold text-white">{plan.price}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <form action="/api/billing/checkout" method="post" className="mt-6">
              <input type="hidden" name="plan" value={plan.name.toLowerCase()} />
              <button className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100">
                Choose {plan.name}
              </button>
            </form>
          </Card>
        ))}
      </div>
    </section>
  );
}
