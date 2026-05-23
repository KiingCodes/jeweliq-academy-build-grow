import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-full px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg shadow-soft">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-semibold tracking-tight">JewelIQ Academy</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#courses" className="hover:text-foreground transition-colors">Courses</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button size="sm" className="bg-gradient-brand text-primary-foreground border-0 shadow-soft">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
