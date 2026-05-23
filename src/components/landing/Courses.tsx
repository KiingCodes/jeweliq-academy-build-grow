import { Clock, Star } from "lucide-react";

const courses = [
  { tag: "Web Development", title: "Modern React & TypeScript", level: "Beginner → Pro", lessons: 64, rating: 4.9, hue: "230" },
  { tag: "Python", title: "Python for Real-World Automation", level: "Beginner", lessons: 42, rating: 4.8, hue: "280" },
  { tag: "AI Engineering", title: "Build AI Apps with LLMs", level: "Intermediate", lessons: 38, rating: 5.0, hue: "300" },
  { tag: "Full-Stack", title: "Ship a SaaS in 30 Days", level: "Advanced", lessons: 52, rating: 4.9, hue: "250" },
  { tag: "Design", title: "UI Engineering with Tailwind", level: "Beginner", lessons: 28, rating: 4.8, hue: "210" },
  { tag: "Career", title: "From Code to First Job", level: "All levels", lessons: 24, rating: 4.9, hue: "320" },
];

export function Courses() {
  return (
    <section id="courses" className="bg-gradient-subtle py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Popular paths</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Courses that actually ship
            </h2>
          </div>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            Browse all courses →
          </a>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <article key={c.title} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
              <div
                className="relative h-40 w-full"
                style={{
                  background: `linear-gradient(135deg, oklch(0.75 0.16 ${c.hue}), oklch(0.55 0.22 ${Number(c.hue) + 30}))`,
                }}
              >
                <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                  {c.tag}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.level}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.lessons} lessons</span>
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {c.rating}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
