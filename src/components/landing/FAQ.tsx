import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do I need any business experience?",
    a: "Not at all. Jewel IT is built for total beginners - but our advanced tracks will sharpen seasoned founders too.",
  },
  {
    q: "What will I learn at Jewel IT Academy?",
    a: "You'll learn practical coding & tech skills including web development, Software engineering, mobile app development, digital entrepreneurship and morden technologies like  AI & cloud computing, depending on your program level. ",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes. Students receive a certificate of completion after successfully finishing their program.",
  },
  {
    q: "How long are the courses?",
    a: "Course duration depends on the program level, but all courses are structured to ensure strong practical skill development within a focused timeframe. ",
  },
  {
    q: "Will I be job ready after completing a course?",
    a: "Yes. Our training is focused on industry-relevent skills, real projects and problem-solving, helping you prepare for roles in software development, freelancing, or entrepreneurship.",
  },
  {
    q: "Who teaches the courses?",
    a: "You'll be taught by experienced developers and tech professionals who understand real-world industry expectations & modern technologies.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2
          style={{ fontFamily: "var(--font-hero)" }}
          className="text-center text-3xl font-medium tracking-tight sm:text-4xl"
        >
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
