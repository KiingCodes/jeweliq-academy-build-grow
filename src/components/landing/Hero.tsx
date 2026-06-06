import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.78 0.16 260 / 0.35), transparent 70%), radial-gradient(40% 40% at 80% 20%, oklch(0.82 0.18 50 / 0.35), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass mx-auto mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent-orange)]" />
            The premium academy for modern founders
          </div>

          <h1
            style={{
              fontFamily: "var(--font-hero)",
              fontWeight: 800,
              fontVariationSettings: '"opsz" 96',
              letterSpacing: "-0.04em",
            }}
            className="text-6xl leading-[0.95] sm:text-7xl lg:text-[6.5rem]"
          >
            Build your{" "}
            <em
              className="not-italic text-gradient"
              style={{ fontStyle: "italic", fontWeight: 500 }}
            >
              online empire
            </em>
            <br className="hidden sm:block" /> from anywhere.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
            JewelIQ Academy is the premium platform for digital entrepreneurs. Master the mindset,
            marketing, and money systems behind every successful online business — with expert
            lessons, an AI coach, and a community of doers. Build your
            <br className="hidden sm:block" />
            <span className="text-gradient">online empire.</span>
          </p>

          <p className="mx-auto mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
            JewelIQ Academy is where digital entrepreneurs learn the mindset, marketing, and money
            systems behind successful online businesses.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-brand group rounded-xl border-0 text-primary-foreground shadow-glow"
            >
              <Link to="/signup">
                Request enrollment
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Enrollment-based access · Cohort programs
          </p>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-4xl grid-cols-3 gap-4 text-center">
          {[
            { k: "10k+", v: "Founders learning" },
            { k: "8", v: "Premium courses" },
            { k: "24/7", v: "AI coaching" },
          ].map((s) => (
            <div key={s.v} className="glass rounded-2xl p-5">
              <div
                style={{ fontFamily: "var(--font-hero)" }}
                className="text-3xl font-medium text-gradient sm:text-4xl"
              >
                {s.k}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
