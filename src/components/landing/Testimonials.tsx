const items = [
  { name: "Amelia R.", role: "Founder, Linen & Co.", quote: "I launched my Shopify store 6 weeks after starting JewelIQ. $14k revenue in month three. The playbooks are gold." },
  { name: "Daniel K.", role: "Course Creator", quote: "Sold my first digital product for $497 the week I finished the Funnels course. JewelIQ doesn't teach theory — it teaches transactions." },
  { name: "Priya S.", role: "Personal Brand Coach", quote: "Beautiful, calm, and addictive. The streaks kept me posting daily and my Instagram tripled in 90 days." },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 style={{ fontFamily: "var(--font-hero)" }} className="mx-auto max-w-2xl text-center text-3xl font-medium tracking-tight sm:text-4xl">
          Loved by founders <em className="text-gradient">building real income</em>
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="glass rounded-2xl p-6 shadow-soft">
              <blockquote className="text-sm leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</blockquote>
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
