import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo className="h-10 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            The premium academy for modern digital entrepreneurs.
          </p>
          <div className="mt-4 flex gap-2 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Learn</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/courses" className="hover:text-foreground">Courses</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/certificates" className="hover:text-foreground">Certificates</Link></li>
            <li><Link to="/tutor" className="hover:text-foreground">AI Coach</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Community</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/community" className="hover:text-foreground">Discussions</Link></li>
            <li><Link to="/community" className="hover:text-foreground">Announcements</Link></li>
            <li><a href="#" className="hover:text-foreground">WhatsApp Group</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Get started</Link></li>
          </ul>
        </div>
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
