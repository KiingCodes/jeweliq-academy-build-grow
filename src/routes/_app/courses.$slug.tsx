import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Check, Circle, Loader2, ArrowLeft, PlayCircle, Search, Bookmark, BookmarkCheck,
  BookOpen, Code2, HelpCircle, Bot, Sparkles, Send, Play, RotateCcw, Trash2, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { askTutor } from "@/lib/tutor.functions";

export const Route = createFileRoute("/_app/courses/$slug")({
  component: CourseDetail,
});

type Lesson = {
  id: string; title: string; content: string | null; order_index: number;
  duration_minutes: number | null; lesson_type: string | null;
  code_language: string | null; starter_code: string | null;
  difficulty: string | null; video_url: string | null;
};
type Quiz = { id: string; question: string; options: string[]; correct_index: number; explanation: string | null; order_index: number };

function CourseDetail() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("read");

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*, lessons(*)").eq("slug", slug).maybeSingle();
      if (data?.lessons) (data.lessons as Lesson[]).sort((a, b) => a.order_index - b.order_index);
      return data;
    },
  });

  const lessons: Lesson[] = course?.lessons ?? [];
  const active = lessons.find((l) => l.id === selectedLesson) ?? lessons[0];

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

  const { data: enrollment } = useQuery({
    queryKey: ["enrollment", user?.id, course?.id],
    enabled: !!user && !!course,
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*").eq("course_id", course!.id).maybeSingle();
      return data;
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

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!course) return <div className="text-center text-muted-foreground">Course not found.</div>;

  const completedIds = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const percent = lessons.length ? Math.round((completedIds.size / lessons.length) * 100) : 0;
  const filtered = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()));
  const isBookmarked = active && bookmarks?.includes(active.id);

  const enroll = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
    if (error) return toast.error(error.message);
    toast.success("Enrolled! Let's go 🚀");
    qc.invalidateQueries({ queryKey: ["enrollment"] });
  };

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
        {!enrollment && <Button onClick={enroll} size="sm" className="bg-gradient-brand text-primary-foreground border-0">Enroll</Button>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
        {/* Left sidebar */}
        <aside className="rounded-2xl border bg-card p-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons" className="h-8 pl-7 text-xs" />
          </div>
          <ul className="space-y-1">
            {filtered.map((l) => {
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
            })}
          </ul>
        </aside>

        {/* Main lesson content */}
        <div className="min-w-0">
          {active ? (
            <article className="rounded-2xl border bg-card p-5 shadow-soft sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">{active.lesson_type ?? "reading"}</Badge>
                <Badge variant="outline" className="capitalize">{active.difficulty ?? "beginner"}</Badge>
                <span className="text-xs text-muted-foreground">⏱ {active.duration_minutes ?? 5} min</span>
                <button onClick={toggleBookmark} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  {isBookmarked ? "Saved" : "Bookmark"}
                </button>
              </div>
              <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">{active.title}</h1>

              <Tabs value={tab} onValueChange={setTab} className="mt-5">
                <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
                  <TabsTrigger value="read"><BookOpen className="mr-1 h-3.5 w-3.5" />Read</TabsTrigger>
                  <TabsTrigger value="code"><Code2 className="mr-1 h-3.5 w-3.5" />Code</TabsTrigger>
                  <TabsTrigger value="quiz"><HelpCircle className="mr-1 h-3.5 w-3.5" />Quiz</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="read" className="mt-5 space-y-5">
                  {active.video_url && (
                    <div className="aspect-video overflow-hidden rounded-xl border bg-black">
                      <iframe className="h-full w-full" src={active.video_url} title={active.title} allowFullScreen />
                    </div>
                  )}
                  {!active.video_url && (
                    <div className="bg-gradient-hero flex aspect-video items-center justify-center rounded-xl text-white/80">
                      <PlayCircle className="h-12 w-12" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                    {active.content ?? "Lesson content coming soon."}
                  </p>
                  {enrollment && (
                    <Button onClick={toggleComplete} variant={completedIds.has(active.id) ? "outline" : "default"} className={completedIds.has(active.id) ? "" : "bg-gradient-brand text-primary-foreground border-0"}>
                      {completedIds.has(active.id) ? "Completed ✓" : "Mark as complete  +25 XP"}
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="code" className="mt-5">
                  <CodePlayground lesson={active} />
                </TabsContent>

                <TabsContent value="quiz" className="mt-5">
                  <QuizSection lessonId={active.id} onPass={toggleComplete} />
                </TabsContent>

                <TabsContent value="notes" className="mt-5">
                  <NotesSection lessonId={active.id} />
                </TabsContent>
              </Tabs>
            </article>
          ) : <p className="text-sm text-muted-foreground">No lessons yet.</p>}
        </div>

        {/* AI Tutor right sidebar */}
        <aside className="rounded-2xl border bg-card p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden lg:flex lg:flex-col">
          <TutorPanel lessonTitle={active?.title} />
        </aside>
      </div>
    </div>
  );
}

/* ---------- Code playground ---------- */
function CodePlayground({ lesson }: { lesson: Lesson }) {
  const lang = lesson.code_language ?? "javascript";
  const initial = lesson.starter_code ?? `// Try writing some ${lang} code\nconsole.log("Hello from JewelIQ");`;
  const [code, setCode] = useState(initial);
  const [out, setOut] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => { setCode(initial); setOut([]); setPreview(null); }, [lesson.id]); // eslint-disable-line

  const run = () => {
    setOut([]); setPreview(null);
    try {
      if (lang === "html") return setPreview(code);
      const logs: string[] = [];
      const c = { log: (...a: unknown[]) => logs.push(a.map(fmt).join(" ")), error: (...a: unknown[]) => logs.push("⚠ " + a.map(fmt).join(" ")), warn: (...a: unknown[]) => logs.push("⚠ " + a.map(fmt).join(" ")) };
      const stripped = lang === "typescript" ? code.replace(/:\s*[A-Za-z<>[\]|&,\s]+(?=[=,)])/g, "") : code;
      const r = new Function("console", stripped)(c);
      if (r !== undefined) logs.push("→ " + fmt(r));
      setOut(logs);
    } catch (e) { setOut([`❌ ${(e as Error).message}`]); }
  };

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 text-xs">
          <span className="font-medium uppercase tracking-wide text-muted-foreground">{lang}</span>
          <div className="flex gap-1">
            <Button onClick={() => setCode(initial)} variant="ghost" size="sm" className="h-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
            <Button onClick={run} size="sm" className="bg-gradient-brand text-primary-foreground border-0 h-7"><Play className="mr-1 h-3.5 w-3.5" />Run</Button>
          </div>
        </div>
        <Editor height="340px" language={lang === "html" ? "html" : lang} value={code} theme="vs-dark" onChange={(v) => setCode(v ?? "")} options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }} />
      </div>
      <div className="flex flex-col overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 text-xs">
          <span className="font-medium uppercase tracking-wide text-muted-foreground">{preview ? "Preview" : "Console"}</span>
          <button onClick={() => { setOut([]); setPreview(null); }} className="text-muted-foreground hover:text-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
        {preview ? <iframe title="preview" srcDoc={preview} className="flex-1 bg-white" sandbox="" />
          : <pre className="min-h-[340px] flex-1 overflow-auto bg-[oklch(0.18_0.03_270)] p-4 font-mono text-xs text-[oklch(0.95_0.02_280)]">{out.length === 0 ? <span className="text-muted-foreground">Click Run to see output.</span> : out.join("\n")}</pre>}
      </div>
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
  if (!quizzes?.length) return <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No quiz for this lesson yet.</div>;

  const score = quizzes.filter((q) => answers[q.id] === q.correct_index).length;
  const passed = submitted && score === quizzes.length;

  return (
    <div className="space-y-5">
      {quizzes.map((q, i) => (
        <div key={q.id} className="rounded-xl border bg-background/50 p-4">
          <p className="text-sm font-medium">{i + 1}. {q.question}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, idx) => {
              const picked = answers[q.id] === idx;
              const correct = submitted && idx === q.correct_index;
              const wrong = submitted && picked && idx !== q.correct_index;
              return (
                <button key={idx} disabled={submitted} onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    correct ? "border-green-500 bg-green-500/10" : wrong ? "border-red-500 bg-red-500/10" :
                    picked ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="mt-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground"><Sparkles className="mr-1 inline h-3 w-3" />{q.explanation}</p>
          )}
        </div>
      ))}
      {!submitted ? (
        <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== quizzes.length} className="bg-gradient-brand text-primary-foreground border-0">Submit answers</Button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${passed ? "text-yellow-500" : "text-muted-foreground"}`} />
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

/* ---------- Notes ---------- */
function NotesSection({ lessonId }: { lessonId: string }) {
  const { user } = useSession();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("lesson_notes").select("content").eq("lesson_id", lessonId).maybeSingle().then(({ data }) => setValue(data?.content ?? ""));
  }, [user, lessonId]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("lesson_notes").upsert({ user_id: user.id, lesson_id: lessonId, content: value }, { onConflict: "user_id,lesson_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Notes saved");
  };

  return (
    <div className="space-y-3">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Jot down your thoughts, key takeaways, or questions for later…" className="min-h-[200px]" />
      <Button onClick={save} disabled={saving} className="bg-gradient-brand text-primary-foreground border-0">{saving ? "Saving…" : "Save notes"}</Button>
    </div>
  );
}

/* ---------- AI Tutor ---------- */
function TutorPanel({ lessonTitle }: { lessonTitle?: string }) {
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: `Hi! I'm your AI tutor. Ask me anything about **${lessonTitle ?? "this lesson"}** — I can explain code, fix errors, simplify concepts, or give you practice exercises.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  const quick = useMemo(() => ["Explain this lesson simply", "Give me a practice exercise", "What are common mistakes?"], []);

  return (
    <>
      <div className="mb-3 flex items-center gap-2 border-b pb-3">
        <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"><Bot className="h-4 w-4" /></div>
        <div>
          <p className="text-sm font-semibold">AI Tutor</p>
          <p className="text-[11px] text-muted-foreground">Always-on coding mentor</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 360 }}>
        {messages.map((m, i) => (
          <div key={i} className={`rounded-xl p-3 text-xs leading-relaxed ${m.role === "user" ? "ml-4 bg-primary/10" : "mr-4 bg-muted/60"}`}>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {quick.map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full border bg-background px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent">{q}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-2 flex gap-1">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…" className="h-9 text-xs" />
        <Button type="submit" size="sm" disabled={loading} className="bg-gradient-brand text-primary-foreground border-0"><Send className="h-3.5 w-3.5" /></Button>
      </form>
    </>
  );
}

function fmt(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}
