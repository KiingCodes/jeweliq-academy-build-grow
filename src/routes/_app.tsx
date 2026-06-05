import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LayoutDashboard, BookOpen, LogOut, Shield, GraduationCap, Award, MessageSquare, AlertCircle, User } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useRoles } from "@/hooks/use-roles";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const baseNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/community", label: "Discussions", icon: MessageSquare },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function AppLayout() {
  const { user, loading } = useSession();
  const { isAdmin, isInstructor, isLoading: rolesLoading, isError: rolesError, error: rolesErrorDetail } = useRoles();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("display_name, avatar_url").eq("id", user!.id).maybeSingle()).data,
  });

  if (loading || !user || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rolesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-6">
        <div className="glass max-w-md rounded-2xl p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h1 className="font-display mt-4 text-xl font-semibold">Couldn't load your permissions</h1>
          <p className="mt-2 text-sm text-muted-foreground">{rolesErrorDetail?.message ?? "Refresh the page and try again."}</p>
        </div>
      </div>
    );
  }

  const nav = [
    ...baseNav,
    ...(isInstructor ? [{ to: "/instructor", label: "Instructor", icon: GraduationCap } as const] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield } as const] : []),
  ];

  const initial = (profile?.display_name ?? user.email ?? "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-card/40 p-5 lg:block">
          <Link to="/" className="flex items-center">
            <Logo className="h-9 w-auto" />
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  preload="intent"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-gradient-brand text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-5 left-5 right-5">
            <Link to="/profile" className="glass flex items-center gap-3 rounded-xl p-3 hover:bg-accent">
              <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-primary-foreground">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{profile?.display_name ?? user.email}</p>
                <button onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await supabase.auth.signOut(); navigate({ to: "/" }); }}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
              </div>
            </Link>
          </div>
        </aside>

        {/* mobile top bar */}
        <div className="lg:hidden fixed inset-x-0 top-0 z-40 border-b bg-card/80 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center">
              <Logo className="h-7 w-auto" />
            </Link>
            <Link to="/profile" className="bg-gradient-brand flex h-7 w-7 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-primary-foreground">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t px-2 py-2 text-xs">
            {nav.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <Link key={item.to} to={item.to} preload="intent" className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 ${active ? "bg-gradient-brand text-primary-foreground" : "text-muted-foreground"}`}>
                  <item.icon className="h-3.5 w-3.5" />{item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="min-w-0 flex-1 p-4 pt-32 sm:p-6 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
