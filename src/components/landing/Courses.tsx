import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Courses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["landing-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, slug, title, category, level, thumbnail_hue, duration_minutes, description")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <section id="courses" className="bg-gradient-subtle py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Popular paths</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Courses that actually ship
            </h2>
          </div>
          <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
            Browse all courses →
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses?.map((c) => (
              <Link
                key={c.id}
                to="/courses/$slug"
                params={{ slug: c.slug }}
                className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div
                  className="relative h-40 w-full"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.75 0.16 ${c.thumbnail_hue}), oklch(0.55 0.22 ${Number(c.thumbnail_hue) + 30}))`,
                  }}
                >
                  <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                    {c.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold leading-snug">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {Math.round((c.duration_minutes ?? 0) / 60)}h</span>
                    <span className="inline-flex items-center gap-1 capitalize"><Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {c.level}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
