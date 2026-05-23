import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Do I need any coding experience?", a: "Not at all. JewelIQ is designed for absolute beginners — but our advanced tracks will challenge experienced devs too." },
  { q: "How does the AI tutor work?", a: "It can explain any line of code, debug your errors, generate exercises tailored to your level, and walk you through concepts in plain English." },
  { q: "Are the certificates recognized?", a: "Each certificate has a unique ID and a public verification page. Many of our learners list them on LinkedIn and use them in job applications." },
  { q: "Can I cancel anytime?", a: "Yes — Pro is month-to-month with no commitment. We also offer a 30-day money-back guarantee." },
  { q: "Will I be able to get a job after?", a: "Our Career path includes portfolio reviews, mock interviews, and access to the JewelIQ job & freelance board." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
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
