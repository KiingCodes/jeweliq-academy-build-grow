import { Bot, Trophy, Zap, Rocket, Users, TrendingUp } from "lucide-react";

const features = [
  { icon: Rocket, title: "Launch-Ready Curriculum", desc: "Eight focused tracks — from idea validation to scaling — designed by operators who have built 6 & 7-figure online businesses." },
  { icon: Bot, title: "AI Business Coach 24/7", desc: "Stuck on a sales page or pitch? Your private AI mentor brainstorms, writes copy, and stress-tests your strategy in seconds." },
  { icon: TrendingUp, title: "Marketing That Converts", desc: "Funnels, ads, content systems, and email sequences — proven playbooks you can copy and ship the same day." },
  { icon: Trophy, title: "Verifiable Certificates", desc: "Earn premium certificates with a public verification page — perfect for LinkedIn, proposals, and credibility." },
  { icon: Zap, title: "Streaks & XP", desc: "Stay accountable with daily streaks, XP, and milestones that turn consistency into compound growth." },
  { icon: Users, title: "Founder Community", desc: "Join thousands of builders trading wins, offers, and feedback inside our private community." },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Why JewelIQ</p>
          <h2 style={{ fontFamily: "var(--font-hero)" }} className="mt-2 text-3xl font-medium tracking-tight sm:text-5xl">
            Everything you need to <em className="text-gradient">build & scale</em> online
          </h2>
          <p className="mt-4 text-muted-foreground">
            We rebuilt online business education from the ground up — premium lessons,
            AI assistance, and a launchpad into the entrepreneur economy.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="bg-gradient-brand mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-soft">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
