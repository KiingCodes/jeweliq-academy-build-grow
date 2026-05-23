import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/courses/")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — JewelIQ Academy" }] }),
});

function CoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">All courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick a path. Build real projects. Ship your career.</p>
      </div>
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card">
              <div className="h-40 rounded-t-2xl bg-muted" />
              <div className="space-y-2 p-5">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((c) => (
            <Link key={c.id} to="/courses/$slug" params={{ slug: c.slug }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
              <div className="relative h-40" style={{ background: `linear-gradient(135deg, oklch(0.75 0.16 ${c.thumbnail_hue}), oklch(0.55 0.22 ${Number(c.thumbnail_hue) + 30}))` }}>
                <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">{c.category}</div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{Math.round((c.duration_minutes ?? 0) / 60)}h</span>
                  <span className="inline-flex items-center gap-1 capitalize"><Star className="h-3.5 w-3.5 fill-current text-amber-500" />{c.level}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
