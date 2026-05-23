const items = [
  { name: "Amelia R.", role: "Junior Developer @ Linear", quote: "I went from zero to a paid dev job in 7 months. The AI tutor was like having a senior engineer beside me every night." },
  { name: "Daniel K.", role: "Indie Hacker", quote: "Shipped my first SaaS during the Full-Stack course. JewelIQ doesn't teach syntax — it teaches you how to build." },
  { name: "Priya S.", role: "Career Switcher", quote: "Beautiful, calm, and surprisingly addictive. The streaks kept me coming back after long workdays." },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Loved by 50,000+ learners shipping real code
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="glass rounded-2xl p-6 shadow-soft">
              <blockquote className="text-sm leading-relaxed text-foreground/90">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="bg-gradient-brand h-9 w-9 rounded-full" />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
