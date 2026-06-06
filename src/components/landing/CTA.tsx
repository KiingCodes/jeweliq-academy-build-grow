import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="bg-gradient-hero relative mx-auto max-w-6xl overflow-hidden rounded-3xl p-10 text-center shadow-glow sm:p-16">
        <div className="absolute inset-0 opacity-30" aria-hidden style={{ background: "radial-gradient(60% 60% at 50% 0%, white, transparent 70%)" }} />
        <div className="relative">
          <h2 style={{ fontFamily: "var(--font-hero)" }} className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
            From idea to income. <br className="hidden sm:block" /> The modern founder&rsquo;s path.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Join 10,000+ entrepreneurs turning skills into scalable online income. Your first lesson is free.
          </p>
          <Button asChild size="lg" className="mt-7 rounded-xl bg-white text-foreground shadow-soft hover:bg-white/90">
            <Link to="/signup">Get started today <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
