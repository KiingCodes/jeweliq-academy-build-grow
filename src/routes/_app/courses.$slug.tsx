import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Check, Circle, Loader2, ArrowLeft, PlayCircle, Bookmark, BookmarkCheck,
  BookOpen, HelpCircle, Sparkles, Trophy, Lock, ChevronDown, ChevronRight, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/courses/$slug")({
  component: CourseDetail,
});

type Lesson = {
  id: string; title: string; content: string | null; order_index: number;
  duration_minutes: number | null; lesson_type: string | null;
  video_url: string | null; difficulty: string | null;
  module_id: string | null;
};
type Module = { id: string; title: string; description: string | null; order_index: number };
type Quiz = { id: string; question: string; options: string[]; correct_index: number; explanation: string | null; order_index: number };

function CourseDetail() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const { isAdmin, isInstructor } = useRoles();
  const qc = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [tab, setTab] = useState("read");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*, lessons(*), modules(*)").eq("slug", slug).maybeSingle();
      if (data?.lessons) (data.lessons as Lesson[]).sort((a, b) => a.order_index - b.order_index);
      if (data?.modules) (data.modules as Module[]).sort((a, b) => a.order_index - b.order_index);
      return data;
    },
  });

  const lessons: Lesson[] = course?.lessons ?? [];
  const modules: Module[] = course?.modules ?? [];
  const active = lessons.find((l) => l.id === selectedLesson) ?? lessons[0];

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", user?.id, course?.id],
    enabled: !!user && !!course,
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*").eq("course_id", course!.id).maybeSingle();
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["lesson-progress", user?.id, course?.id],
    enabled: !!user && !!course,
    queryFn: async () => {
      const ids = lessons.map((l) => l.id);
      if (!ids.length) return [];
      const { data } = await supabase.from("lesson_progress").select("*").in("lesson_id", ids);
      return data ?? [];
    },
  });

  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("bookmarks").select("lesson_id");
      return data?.map((b) => b.lesson_id) ?? [];
    },
  });

  useEffect(() => {
    if (modules.length && Object.keys(openModules).length === 0) {
      setOpenModules(Object.fromEntries(modules.map((m) => [m.id, true])));
    }
  }, [modules, openModules]);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!course) return <div className="text-center text-muted-foreground">Course not found.</div>;

  const isStaff = isAdmin || isInstructor;
  const hasAccess = isStaff || !!enrollment;

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-lg">
        <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="glass rounded-2xl p-10 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="font-display mt-4 text-2xl font-semibold">{course.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This course is for enrolled students only. Reach out to be added to the program.
          </p>
          <a href={`mailto:hello@jeweliq.academy?subject=Access to ${course.title}`} className="bg-gradient-brand mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft">
            <Mail className="h-4 w-4" /> Request enrollment
          </a>
        </div>
      </div>
    );
  }

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const percent = lessons.length ? Math.round((completedIds.size / lessons.length) * 100) : 0;
  const isBookmarked = active && bookmarks?.includes(active.id);
  const unassigned = lessons.filter((l) => !l.module_id);

  const toggleComplete = async () => {
    if (!user || !active) return;
    const already = completedIds.has(active.id);
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: user.id, lesson_id: active.id, completed: !already, completed_at: !already ? new Date().toISOString() : null },
      { onConflict: "user_id,lesson_id" },
    );
    if (error) return toast.error(error.message);
    if (!already) toast.success("+25 XP — lesson complete! 🎉");
    qc.invalidateQueries({ queryKey: ["lesson-progress"] });
  };

  const toggleBookmark = async () => {
    if (!user || !active) return;
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("lesson_id", active.id);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, lesson_id: active.id });
    }
    qc.invalidateQueries({ queryKey: ["bookmarks"] });
  };

  const lessonItem = (l: Lesson) => {
    const done = completedIds.has(l.id);
    const isActive = active?.id === l.id;
    return (
      <li key={l.id}>
        <button onClick={() => { setSelectedLesson(l.id); setTab("read"); }}
          className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${isActive ? "bg-accent" : "hover:bg-accent/60"}`}>
          {done ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{l.title}</span>
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{l.lesson_type ?? "reading"} · {l.duration_minutes ?? 5}m</span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div>
      <Link to="/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      {/* Sticky progress */}
      <div className="glass sticky top-0 z-20 -mx-4 mb-4 flex items-center gap-3 rounded-none border-b px-4 py-2 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{course.title}</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-gradient-brand h-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{percent}%</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Sidebar with modules */}
        <aside className="rounded-2xl border bg-card p-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Curriculum</p>
          {modules.map((m) => {
            const moduleLessons = lessons.filter((l) => l.module_id === m.id);
            const open = openModules[m.id];
            const done = moduleLessons.filter((l) => completedIds.has(l.id)).length;
            return (
              <div key={m.id} className="mb-2">
                <button onClick={() => setOpenModules({ ...openModules, [m.id]: !open })}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-accent/60">
                  {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{m.title}</span>
                    <span className="block text-[10px] text-muted-foreground">{done}/{moduleLessons.length} complete</span>
                  </span>
                </button>
                {open && <ul className="ml-3 mt-1 space-y-0.5 border-l pl-2">{moduleLessons.map(lessonItem)}</ul>}
              </div>
            );
          })}
          {unassigned.length > 0 && (
            <div className="mt-3">
              {modules.length > 0 && <p className="px-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Other lessons</p>}
              <ul className="space-y-0.5">{unassigned.map(lessonItem)}</ul>
            </div>
          )}
          {lessons.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">No lessons yet.</p>}
        </aside>

        {/* Main content — full width now */}
        <div className="min-w-0">
          {active ? (
            <article className="rounded-2xl border bg-card p-6 shadow-soft sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">{active.lesson_type ?? "reading"}</Badge>
                <Badge variant="outline" className="capitalize">{active.difficulty ?? "beginner"}</Badge>
                <span className="text-xs text-muted-foreground">⏱ {active.duration_minutes ?? 5} min</span>
                <button onClick={toggleBookmark} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  {isBookmarked ? "Saved" : "Bookmark"}
                </button>
              </div>
              <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{active.title}</h1>

              <Tabs value={tab} onValueChange={setTab} className="mt-6">
                <TabsList>
                  <TabsTrigger value="read"><BookOpen className="mr-1 h-3.5 w-3.5" />Lesson</TabsTrigger>
                  <TabsTrigger value="quiz"><HelpCircle className="mr-1 h-3.5 w-3.5" />Quiz</TabsTrigger>
                </TabsList>

                <TabsContent value="read" className="mt-6">
                  <ReadingView lesson={active} />
                  <div className="mt-10 flex items-center justify-between gap-3 border-t pt-6">
                    <p className="text-xs text-muted-foreground">When you're done reading, mark this lesson complete.</p>
                    <Button onClick={toggleComplete} variant={completedIds.has(active.id) ? "outline" : "default"} className={completedIds.has(active.id) ? "" : "bg-gradient-brand text-primary-foreground border-0"}>
                      {completedIds.has(active.id) ? "Completed ✓" : "Mark complete +25 XP"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="mt-6">
                  <QuizSection lessonId={active.id} onPass={toggleComplete} />
                </TabsContent>
              </Tabs>
            </article>
          ) : <p className="text-sm text-muted-foreground">No lessons yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reading view ---------- */
function ReadingView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-6">
      <LessonMedia lesson={lesson} />
      {lesson.content ? (
        <div className="prose-content whitespace-pre-wrap text-[17px] leading-[1.75] text-foreground/90">
          {lesson.content}
        </div>
      ) : (
        !lesson.video_url && <p className="text-sm text-muted-foreground">Lesson content coming soon.</p>
      )}
    </div>
  );
}

function LessonMedia({ lesson }: { lesson: Lesson }) {
  const url = lesson.video_url;
  const type = lesson.lesson_type ?? "reading";
  if (!url) {
    if (type === "reading") return null;
    return (
      <div className="bg-gradient-hero flex aspect-video items-center justify-center rounded-xl text-white/80">
        <PlayCircle className="h-12 w-12" />
      </div>
    );
  }
  if (type === "image") {
    return <img src={url} alt={lesson.title} className="w-full rounded-xl border" loading="lazy" />;
  }
  if (type === "audio") {
    return (
      <div className="glass rounded-xl p-4">
        <audio controls src={url} className="w-full" />
      </div>
    );
  }
  const isEmbed = /youtube|youtu\.be|vimeo|loom/.test(url);
  if (isEmbed) {
    const src = url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
    return (
      <div className="aspect-video overflow-hidden rounded-xl border bg-black">
        <iframe className="h-full w-full" src={src} title={lesson.title} allowFullScreen />
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-black">
      <video controls src={url} className="aspect-video w-full" />
    </div>
  );
}

/* ---------- Quiz ---------- */
function QuizSection({ lessonId, onPass }: { lessonId: string; onPass: () => void }) {
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", lessonId],
    queryFn: async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("lesson_id", lessonId).order("order_index");
      return (data ?? []) as unknown as Quiz[];
    },
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setAnswers({}); setSubmitted(false); }, [lessonId]);

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  if (!quizzes?.length) return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No quiz for this lesson yet.</div>;

  const score = quizzes.filter((q) => answers[q.id] === q.correct_index).length;
  const passed = submitted && score === quizzes.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {quizzes.map((q, i) => (
        <div key={q.id} className="rounded-xl border bg-background/50 p-5">
          <p className="text-base font-medium leading-snug">{i + 1}. {q.question}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, idx) => {
              const picked = answers[q.id] === idx;
              const correct = submitted && idx === q.correct_index;
              const wrong = submitted && picked && idx !== q.correct_index;
              return (
                <button key={idx} disabled={submitted} onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                    correct ? "border-green-500 bg-green-500/10" : wrong ? "border-red-500 bg-red-500/10" :
                    picked ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground"><Sparkles className="mr-1 inline h-3 w-3" />{q.explanation}</p>
          )}
        </div>
      ))}
      {!submitted ? (
        <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== quizzes.length} size="lg" className="bg-gradient-brand text-primary-foreground border-0">Submit answers</Button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Trophy className={`h-6 w-6 ${passed ? "text-yellow-500" : "text-muted-foreground"}`} />
            <span className="text-sm font-medium">{score} / {quizzes.length} correct {passed && "— perfect! 🎉"}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retry</Button>
            {passed && <Button size="sm" onClick={onPass} className="bg-gradient-brand text-primary-foreground border-0">Mark complete</Button>}
          </div>
        </div>
      )}
    </div>
  );
}
