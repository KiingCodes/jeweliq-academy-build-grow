import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";

import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "JewelIQ Academy — Master Digital Entrepreneurship" },
      { name: "description", content: "Premium digital entrepreneurship academy. Learn to launch, grow, and scale online businesses." },
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
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
