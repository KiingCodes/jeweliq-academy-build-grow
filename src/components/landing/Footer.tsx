import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">JewelIQ Academy</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Premium coding education for the next generation of builders.
          </p>
          <div className="mt-4 flex gap-2 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        {[
          { title: "Learn", links: ["Courses", "Paths", "Playground", "Certificates"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "Resources", links: ["Community", "Job Board", "Help Center", "Status"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 JewelIQ Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
