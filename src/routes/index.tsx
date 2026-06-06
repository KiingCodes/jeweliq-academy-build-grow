import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Courses } from "@/components/landing/Courses";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "JewelIQ Academy — Master Digital Entrepreneurship" },
      { name: "description", content: "Premium digital entrepreneurship academy. Learn to launch, grow, and scale online businesses with expert lessons, an AI coach, and a founder community." },
      { property: "og:title", content: "JewelIQ Academy" },
      { property: "og:description", content: "Idea to income. The modern founder's path." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Courses />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
