import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, oklch(0.85 0.12 285 / 0.35), transparent 70%), radial-gradient(40% 40% at 80% 20%, oklch(0.85 0.12 230 / 0.3), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="bg-gradient-brand h-1.5 w-1.5 rounded-full" />
            AI-powered learning · Live in 2026
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Learn coding by <span className="text-gradient">building real</span> projects.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            From your first line of code to your first paycheck. JewelIQ Academy blends
            premium courses, an AI tutor, and a hands-on playground to take you from
            beginner to professional developer.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground border-0 shadow-glow group">
              Start learning free
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl">
              <Play className="mr-1 h-4 w-4" /> Watch demo
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever plan · No credit card required
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div
            aria-hidden
            className="absolute -inset-x-10 -inset-y-6 -z-10 rounded-[3rem] blur-3xl opacity-50"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="glass overflow-hidden rounded-3xl shadow-glow">
            <img
              src={heroImg}
              alt="Floating code editors and crystalline shapes"
              width={1600}
              height={1200}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
