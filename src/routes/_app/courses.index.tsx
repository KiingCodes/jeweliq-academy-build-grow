import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star, Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useRoles } from "@/hooks/use-roles";

export const Route = createFileRoute("/_app/courses/")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — JewelIQ Academy" }] }),
});

function CoursesPage() {
  const { user } = useSession();
  const { isAdmin, isInstructor } = useRoles();

  const { data: enrollments, isLoading: enrLoading } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("course_id");
      return data?.map((e) => e.course_id) ?? [];
    },
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const isStaff = isAdmin || isInstructor;
  const enrolledSet = new Set(enrollments ?? []);
  const visible = isStaff ? courses ?? [] : (courses ?? []).filter((c) => enrolledSet.has(c.id));
  const loading = isLoading || enrLoading;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isStaff ? "Staff view — all courses on the platform." : "These are the courses you're enrolled in."}
        </p>
      </div>

      {loading ? (
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
      ) : visible.length === 0 ? (
        <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="font-display mt-4 text-2xl font-semibold">No enrolled courses yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Course access is granted by enrollment. Contact our team to request access to a program.
          </p>
          <a href="mailto:hello@jeweliq.academy" className="bg-gradient-brand mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft">
            <Mail className="h-4 w-4" /> Request access
          </a>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
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
