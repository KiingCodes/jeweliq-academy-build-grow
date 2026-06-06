import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Star, Lock, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/courses/")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — JewelIQ Academy" }] }),
});

function CoursesPage() {
  const { user } = useSession();
  const { isAdmin, isInstructor } = useRoles();
  const [requestOpen, setRequestOpen] = useState(false);

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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isStaff ? "Staff view — all courses on the platform." : "The programs you're enrolled in."}
          </p>
        </div>
        {!isStaff && (
          <Button onClick={() => setRequestOpen(true)} className="bg-gradient-brand text-primary-foreground border-0">
            <Send className="mr-1.5 h-4 w-4" /> Request enrollment
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card">
              <div className="h-40 rounded-t-2xl bg-muted" />
              <div className="space-y-2 p-5"><div className="h-4 w-1/3 rounded bg-muted" /><div className="h-5 rounded bg-muted" /></div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass mx-auto max-w-xl rounded-2xl p-10 text-center">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="font-display mt-4 text-2xl font-semibold">No courses unlocked yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            JewelIQ Academy is enrollment-based. Tell us which program you'd like to join and we'll get back to you within 24 hours.
          </p>
          <Button onClick={() => setRequestOpen(true)} className="bg-gradient-brand text-primary-foreground border-0 mt-6">
            <Send className="mr-1.5 h-4 w-4" /> Request enrollment
          </Button>
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

      <RequestDialog open={requestOpen} onOpenChange={setRequestOpen} courses={courses ?? []} />
    </div>
  );
}

function RequestDialog({ open, onOpenChange, courses }: { open: boolean; onOpenChange: (v: boolean) => void; courses: any[] }) {
  const { user } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [courseId, setCourseId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email.trim()) return toast.error("Email is required");
    setSending(true);
    const { error } = await supabase.from("enrollment_requests" as never).insert({
      user_id: user?.id ?? null, email, full_name: name || null, course_id: courseId || null, message: message || null,
    } as never);
    setSending(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success("Request sent! We'll be in touch soon.");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setDone(false); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Request enrollment</DialogTitle></DialogHeader>
        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-sm font-medium">Request received</p>
            <p className="mt-1 text-xs text-muted-foreground">An admin will review and unlock your access shortly.</p>
            <Button className="mt-5" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div><label className="text-xs font-medium">Full name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></div>
              <div><label className="text-xs font-medium">Email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" /></div>
              <div>
                <label className="text-xs font-medium">Course of interest</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">— Any / not sure yet —</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium">Anything else?</label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Tell us about your goals…" /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={submit} disabled={sending} className="bg-gradient-brand text-primary-foreground border-0">
                {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                Send request
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
