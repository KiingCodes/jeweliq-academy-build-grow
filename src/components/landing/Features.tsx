import {
  Code2,
  Briefcase,
  Lightbulb,
  GraduationCap,
  Cpu,
  Rocket,
  MonitorSmartphone,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Learn by Building",
    desc: "Work on real-world projects, websites, mobile apps, and software solutions that strengthen your portfolio & practical experience.",
  },
  {
    icon: Briefcase,
    title: "Industry-Ready Coding Skills",
    desc: "Learn the tools, frameworks, and best practices used by modern software companies and tech teams worldwide.",
  },
  {
    icon: Lightbulb,
    title: "Innovation-Driven Learning",
    desc: "Develop problem-solving, creativity, and critical thinking skills that prepare you to build impactful digital solutions.",
  },
  {
    icon: GraduationCap,
    title: "Expert Mentorship",
    desc: "Learn from experienced developers, entrepreneurs, and industry professionals who guide your growth every step of the way.",
  },
  {
    icon: Cpu,
    title: "Future-Focused Technologies",
    desc: "Explore AI, cloud computing, automation, web development, mobile apps, and emerging technologies shaping tomorrow.",
  },
  {
    icon: Rocket,
    title: "Career & Entrepreneurship Pathways",
    desc: "Whether you want a tech career, freelance business, startup, or digital agency, gain the skills to achieve your goals.",
  },
  {
    icon: MonitorSmartphone,
    title: "Modern Learning Experience",
    desc: "Enjoy interactive lessons, practical assignments, progress tracking, certifications, and AI-powered learning support.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Why Jewel IT Academy?</p>
          <h2
            style={{ fontFamily: "var(--font-hero)" }}
            className="mt-2 text-3xl font-medium tracking-tight sm:text-5xl"
          >
            Everything you need to <em className="text-gradient">build & scale</em> online
          </h2>
          <p className="mt-4 text-muted-foreground">
            At Jewel IT Academy, technology education goes beyond theory. We empower ambitious
            learners to master coding, build innovative solutions & develop the skills needed to
            thrive in the digital economy. Through hands-on projects, expert mentorship &
            industry-focused training, students gain the confidence to transform ideas into
            impactful software, businesses and careers.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="bg-gradient-brand mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground shadow-soft">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
