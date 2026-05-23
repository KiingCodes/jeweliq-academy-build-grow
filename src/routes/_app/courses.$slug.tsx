import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Circle, Loader2, ArrowLeft, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/courses/$slug")({
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*, lessons(*)").eq("slug", slug).maybeSingle();
      if (data?.lessons) data.lessons.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index);
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", user?.id, course?.id],
    enabled: !!user && !!course,
    queryFn: async () => {
      const lessonIds = (course?.lessons ?? []).map((l: { id: string }) => l.id);
      if (lessonIds.length === 0) return [];
      const { data } = await supabase.from("lesson_progress").select("*").in("lesson_id", lessonIds);
      return data ?? [];
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", user?.id, course?.id],
    enabled: !!user && !!course,
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*").eq("course_id", course!.id).maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!course) return <div className="text-center text-muted-foreground">Course not found.</div>;

  const lessons = course.lessons ?? [];
  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const active = lessons.find((l: { id: string }) => l.id === selectedLesson) ?? lessons[0];

  const enroll = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Enrolled! Let's go 🚀");
    qc.invalidateQueries({ queryKey: ["enrollment"] });
    qc.invalidateQueries({ queryKey: ["enrollments"] });
  };

  const toggleComplete = async (lessonId: string) => {
    if (!user) return;
    const already = completedIds.has(lessonId);
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: user.id, lesson_id: lessonId, completed: !already, completed_at: !already ? new Date().toISOString() : null },
      { onConflict: "user_id,lesson_id" },
    );
    if (error) { toast.error(error.message); return; }
    if (!already) {
      await supabase.rpc; // noop, future hook
      await supabase.from("profiles").update({ xp: 0 }).eq("id", user.id); // placeholder
    }
    qc.invalidateQueries({ queryKey: ["lesson-progress"] });
  };

  const percent = lessons.length ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  return (
    <div>
      <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
        <div className="relative h-44 sm:h-56" style={{ background: `linear-gradient(135deg, oklch(0.75 0.16 ${course.thumbnail_hue}), oklch(0.55 0.22 ${Number(course.thumbnail_hue) + 30}))` }}>
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8" style={{ background: "linear-gradient(180deg, transparent, oklch(0 0 0 / 0.25))" }}>
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">{course.category}</p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-white sm:text-4xl">{course.title}</h1>
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>
          <div className="space-y-3">
            {enrollment ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs"><span>Progress</span><span>{percent}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="bg-gradient-brand h-full transition-all" style={{ width: `${percent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{completedIds.size} of {lessons.length} lessons completed</p>
              </div>
            ) : (
              <Button onClick={enroll} className="bg-gradient-brand w-full text-primary-foreground border-0">Enroll for free</Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="glass rounded-2xl p-6">
          {active ? (
            <article>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lesson {(active.order_index ?? 0)}</p>
              <h2 className="font-display mt-1 text-2xl font-semibold">{active.title}</h2>
              <div className="bg-gradient-hero mt-5 flex aspect-video items-center justify-center rounded-2xl text-white/80">
                <PlayCircle className="h-12 w-12" />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-foreground/90">{active.content}</p>
              {enrollment && (
                <Button onClick={() => toggleComplete(active.id)} className="mt-6" variant={completedIds.has(active.id) ? "outline" : "default"}>
                  {completedIds.has(active.id) ? "Completed ✓" : "Mark as complete"}
                </Button>
              )}
            </article>
          ) : <p className="text-sm text-muted-foreground">No lessons yet.</p>}
        </div>

        <aside className="rounded-2xl border bg-card p-4">
          <h3 className="px-2 py-1 text-sm font-semibold">Lessons</h3>
          <ul className="mt-2 space-y-1">
            {lessons.map((l: { id: string; title: string; order_index: number; duration_minutes: number | null }) => {
              const done = completedIds.has(l.id);
              const isActive = active?.id === l.id;
              return (
                <li key={l.id}>
                  <button onClick={() => setSelectedLesson(l.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-accent" : "hover:bg-accent/60"}`}>
                    {done ? <Check className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    <span className="flex-1 truncate">{l.title}</span>
                    <span className="text-xs text-muted-foreground">{l.duration_minutes}m</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
