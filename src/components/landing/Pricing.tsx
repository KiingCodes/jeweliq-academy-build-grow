import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Everything you need to get started.",
    features: ["10 starter lessons", "Code playground", "Community access", "Basic AI hints"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    desc: "For learners serious about a dev career.",
    features: ["All courses & paths", "Unlimited AI tutor", "Premium certificates", "Project reviews", "Job board access"],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    name: "Teams",
    price: "$49",
    period: "/ seat",
    desc: "Upskill your entire engineering team.",
    features: ["Everything in Pro", "Team dashboards", "Custom learning paths", "Admin & SSO", "Priority support"],
    cta: "Contact sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-gradient-subtle py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Simple plans. Real outcomes.
          </h2>
          <p className="mt-4 text-muted-foreground">Cancel anytime. 30-day money-back guarantee on Pro.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border bg-card p-7 shadow-soft ${
                p.highlight ? "ring-2 ring-primary shadow-glow lg:-translate-y-3" : ""
              }`}
            >
              {p.highlight && (
                <div className="bg-gradient-brand absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most popular
                </div>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <Button
                className={`mt-6 w-full ${p.highlight ? "bg-gradient-brand text-primary-foreground border-0" : ""}`}
                variant={p.highlight ? "default" : "outline"}
              >
                {p.cta}
              </Button>
              <ul className="mt-7 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
