import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, BookOpen, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — JewelIQ Academy" }] }),
});

function Dashboard() {
  const { user } = useSession();
  const userId = user?.id;

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      return data;
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("enrollments")
        .select("course_id, enrolled_at, courses(*)")
        .order("enrolled_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: recommended } = useQuery({
    queryKey: ["recommended-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").limit(3);
      return data ?? [];
    },
  });

  const name = profile?.display_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {name} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off and keep your streak alive.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Flame} label="Streak" value={`${profile?.streak_days ?? 0} days`} hue="20" />
        <Stat icon={Sparkles} label="XP earned" value={`${profile?.xp ?? 0}`} hue="280" />
        <Stat icon={BookOpen} label="Enrolled courses" value={`${enrollments?.length ?? 0}`} hue="230" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Continue learning</h2>
          <Link to="/courses" className="text-sm text-primary hover:underline">All courses →</Link>
        </div>
        {enrollments && enrollments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments.map((e) => e.courses && (
              <Link key={e.course_id} to="/courses/$slug" params={{ slug: e.courses.slug }} className="group glass flex items-center gap-4 rounded-2xl p-4 shadow-soft transition hover:shadow-glow">
                <div className="h-16 w-16 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg, oklch(0.75 0.16 ${e.courses.thumbnail_hue}), oklch(0.55 0.22 ${Number(e.courses.thumbnail_hue) + 30}))` }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{e.courses.category}</p>
                  <h3 className="truncate font-semibold">{e.courses.title}</h3>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You haven't enrolled in a course yet.</p>
            <Button asChild className="bg-gradient-brand mt-4 text-primary-foreground border-0">
              <Link to="/courses">Browse courses</Link>
            </Button>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-semibold">Recommended for you</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended?.map((c) => (
            <Link key={c.id} to="/courses/$slug" params={{ slug: c.slug }} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
              <div className="h-28" style={{ background: `linear-gradient(135deg, oklch(0.75 0.16 ${c.thumbnail_hue}), oklch(0.55 0.22 ${Number(c.thumbnail_hue) + 30}))` }} />
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{c.category}</p>
                <h3 className="font-semibold leading-snug">{c.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hue }: { icon: React.ElementType; label: string; value: string; hue: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 shadow-soft">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl"
        style={{ background: `oklch(0.7 0.2 ${hue})` }} />
      <div className="relative">
        <Icon className="h-5 w-5 text-primary" />
        <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-display mt-1 text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
