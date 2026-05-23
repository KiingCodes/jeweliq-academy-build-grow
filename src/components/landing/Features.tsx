import { Bot, Code2, Trophy, Zap, GraduationCap, Users } from "lucide-react";

const features = [
  { icon: Bot, title: "AI Tutor 24/7", desc: "Stuck on a bug? Your personal AI mentor explains code, fixes errors, and generates new exercises in seconds." },
  { icon: Code2, title: "Interactive Playground", desc: "A full Monaco-powered editor with JavaScript, TypeScript, Python, and HTML/CSS — right in your browser." },
  { icon: GraduationCap, title: "Real-World Projects", desc: "Ship portfolio-grade apps from day one. Each course ends with a project you can show employers." },
  { icon: Trophy, title: "Verifiable Certificates", desc: "Earn premium, blockchain-verifiable certificates that recruiters can actually check." },
  { icon: Zap, title: "Gamified Progress", desc: "Streaks, XP, badges, and leaderboards turn consistency into a habit you'll love." },
  { icon: Users, title: "Builder Community", desc: "Join thousands of learners shipping side projects, sharing code, and landing jobs together." },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Why JewelIQ</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to become a developer
          </h2>
          <p className="mt-4 text-muted-foreground">
            We rebuilt online coding education from the ground up — premium content, AI
            assistance, and a launchpad to a real career.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
            >
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
