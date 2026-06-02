import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Do I need any business experience?", a: "Not at all. JewelIQ is built for total beginners — but our advanced tracks will sharpen seasoned founders too." },
  { q: "How does the AI coach work?", a: "Brainstorm offers, write sales copy, plan content calendars, debug funnels, and pressure-test your strategy — all inside the platform." },
  { q: "Are the certificates recognized?", a: "Every certificate has a unique ID and a public verification page. Add them to LinkedIn, proposals, and your About page with confidence." },
  { q: "How long does each course take?", a: "Most courses are 3–6 hours of focused content plus exercises. Go at your pace — your progress is saved across devices." },
  { q: "Will this work for my country / language?", a: "The frameworks work globally. We teach principles, not local hacks — and learners ship from 60+ countries." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 style={{ fontFamily: "var(--font-hero)" }} className="text-center text-3xl font-medium tracking-tight sm:text-4xl">
          Frequently asked <em className="text-gradient">questions</em>
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
