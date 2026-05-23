import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="bg-gradient-hero relative mx-auto max-w-6xl overflow-hidden rounded-3xl p-10 text-center shadow-glow sm:p-16">
        <div className="absolute inset-0 opacity-30" aria-hidden style={{ background: "radial-gradient(60% 60% at 50% 0%, white, transparent 70%)" }} />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Build skills. Build products. <br className="hidden sm:block" /> Build your future.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Join 50,000+ learners turning curiosity into a career. Your first lesson is free.
          </p>
          <Button size="lg" className="mt-7 rounded-xl bg-white text-foreground hover:bg-white/90 shadow-soft">
            Get started today <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
