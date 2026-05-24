import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3">
      <div className="glass mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-full px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/courses" className="hover:text-foreground transition-colors">Courses</Link>
          <Link to="/playground" className="hover:text-foreground transition-colors">Playground</Link>
          <Link to="/tutor" className="hover:text-foreground transition-colors">AI Tutor</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-gradient-brand flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground shadow-soft">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard"><UserIcon className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="bg-gradient-brand text-primary-foreground border-0 shadow-soft" asChild>
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
