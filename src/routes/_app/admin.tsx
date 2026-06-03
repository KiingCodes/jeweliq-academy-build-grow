import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Shield, Users, BookOpen, Activity, DollarSign, Loader2, Lock, Megaphone,
  Plus, Trash2, Pencil, ChevronDown, ChevronRight, Layers, HelpCircle, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — JewelIQ Academy" }] }),
});

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminDashboard() {
  const { isAdmin, isLoading } = useRoles();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ count: courses }, { count: profiles }, { count: enrollments }, { count: certs }] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("certificates" as never).select("*", { count: "exact", head: true }),
      ]);
      return { courses: courses ?? 0, users: profiles ?? 0, enrollments: enrollments ?? 0, certs: certs ?? 0 };
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, display_name, xp, streak_days, created_at").order("created_at", { ascending: false }).limit(100);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string[]>();
      roles?.forEach((r) => { const list = roleMap.get(r.user_id) ?? []; list.push(r.role); roleMap.set(r.user_id, list); });
      return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses"],
    enabled: isAdmin,
    queryFn: async () => (await supabase.from("courses").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const promote = async (userId: string, role: "instructor" | "admin") => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success(`Promoted to ${role}`);
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const postAnn = async () => {
    if (!annTitle.trim()) return;
    const { error } = await supabase.from("announcements" as never).insert([{ title: annTitle, body: annBody }] as any);
    if (error) return toast.error(error.message);
    setAnnTitle(""); setAnnBody("");
    toast.success("Announcement published");
  };

  const [enrollUser, setEnrollUser] = useState("");
  const [enrollCourse, setEnrollCourse] = useState("");
  const enrollStudent = async () => {
    if (!enrollUser || !enrollCourse) return toast.error("Pick a student and a course");
    const { error } = await supabase.from("enrollments").insert({ user_id: enrollUser, course_id: enrollCourse });
    if (error) return toast.error(error.message);
    toast.success("Student enrolled");
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    setEnrollUser(""); setEnrollCourse("");
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;

  if (!isAdmin) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="font-display mt-4 text-xl font-semibold">Admin only</h2>
        <p className="mt-2 text-sm text-muted-foreground">This area is restricted to platform administrators.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  const tiles = [
    { label: "Users", value: stats?.users ?? 0, icon: Users },
    { label: "Courses", value: stats?.courses ?? 0, icon: BookOpen },
    { label: "Enrollments", value: stats?.enrollments ?? 0, icon: Activity },
    { label: "Revenue", value: "$0", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Platform control</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <t.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-display mt-2 text-3xl font-semibold">{t.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="content">
        <TabsList className="flex-wrap">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="enroll">Enroll</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <ContentManager courses={courses ?? []} />
        </TabsContent>

        <TabsContent value="enroll" className="mt-4">
          <div className="glass space-y-3 rounded-2xl p-5">
            <h3 className="font-semibold">Enroll a student in a course</h3>
            <Select value={enrollUser} onValueChange={setEnrollUser}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {users?.map((u) => (<SelectItem key={u.id} value={u.id}>{u.display_name ?? u.id.slice(0, 8)}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={enrollCourse} onValueChange={setEnrollCourse}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button onClick={enrollStudent} className="bg-gradient-brand text-primary-foreground border-0"><Plus className="mr-1 h-4 w-4" />Enroll student</Button>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">XP</th><th className="p-3 text-left">Streak</th><th className="p-3 text-left">Roles</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="p-3">{u.display_name ?? "—"}</td>
                    <td className="p-3">{u.xp}</td>
                    <td className="p-3">{u.streak_days}d</td>
                    <td className="p-3"><span className="text-xs">{u.roles.join(", ") || "student"}</span></td>
                    <td className="p-3 text-right">
                      {!u.roles.includes("instructor") && <Button size="sm" variant="ghost" onClick={() => promote(u.id, "instructor")}>+ Instructor</Button>}
                      {!u.roles.includes("admin") && <Button size="sm" variant="ghost" onClick={() => promote(u.id, "admin")}>+ Admin</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <div className="glass space-y-3 rounded-2xl p-5">
            <div className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /><h3 className="font-semibold">Post announcement</h3></div>
            <Input placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
            <Textarea placeholder="Message" value={annBody} onChange={(e) => setAnnBody(e.target.value)} rows={3} />
            <Button onClick={postAnn} className="bg-gradient-brand text-primary-foreground border-0"><Plus className="mr-1 h-4 w-4" />Publish</Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">Platform settings</h3>
            <p className="mt-2 text-sm text-muted-foreground">Branding, billing, integrations, and limits.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-3 text-sm"><strong>Total certificates issued:</strong> {stats?.certs ?? 0}</div>
              <div className="rounded-xl border p-3 text-sm"><strong>Active platform:</strong> Lovable Cloud</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ===================== Content Manager ===================== */
type Course = { id: string; slug: string; title: string; description: string | null; category: string | null; level: string; is_published: boolean; thumbnail_hue: string | null; duration_minutes: number | null };

function ContentManager({ courses }: { courses: Course[] }) {
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(courses[0]?.id ?? null);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const selected = courses.find((c) => c.id === selectedCourseId) ?? courses[0];

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("courses").update({ is_published: !current }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    toast.success(current ? "Unpublished" : "Published");
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course and ALL its modules, lessons, and quizzes?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSelectedCourseId(null);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    toast.success("Course deleted");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border bg-card p-3">
        <div className="flex items-center justify-between px-2 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Courses</p>
          <Button size="sm" variant="ghost" onClick={() => { setEditingCourse(null); setShowCourseDialog(true); }}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <ul className="space-y-1">
          {courses.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSelectedCourseId(c.id)}
                className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${selected?.id === c.id ? "bg-accent" : "hover:bg-accent/60"}`}>
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.title}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{c.category} · {c.is_published ? "published" : "draft"}</span>
                </span>
              </button>
            </li>
          ))}
          {courses.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted-foreground">No courses yet.</p>}
        </ul>
      </aside>

      <div className="min-w-0">
        {selected ? (
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge variant={selected.is_published ? "default" : "outline"}>{selected.is_published ? "Published" : "Draft"}</Badge>
                <h2 className="font-display mt-2 text-2xl font-semibold">{selected.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingCourse(selected); setShowCourseDialog(true); }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                <Button size="sm" variant="outline" onClick={() => togglePublish(selected.id, selected.is_published)}>{selected.is_published ? "Unpublish" : "Publish"}</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteCourse(selected.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="mt-6">
              <ModulesPanel courseId={selected.id} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
            Create a course to get started.
          </div>
        )}
      </div>

      {showCourseDialog && (
        <CourseDialog course={editingCourse} onClose={() => setShowCourseDialog(false)} onSaved={(c) => { setSelectedCourseId(c.id); setShowCourseDialog(false); }} />
      )}
    </div>
  );
}

/* ----- Course dialog ----- */
function CourseDialog({ course, onClose, onSaved }: { course: Course | null; onClose: () => void; onSaved: (c: Course) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [category, setCategory] = useState(course?.category ?? "Foundations");
  const [level, setLevel] = useState(course?.level ?? "beginner");
  const [hue, setHue] = useState(course?.thumbnail_hue ?? "280");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = { title, description, category, level, thumbnail_hue: hue, slug: course?.slug ?? slugify(title), is_published: course?.is_published ?? false };
    const q = course
      ? supabase.from("courses").update(payload).eq("id", course.id).select().single()
      : supabase.from("courses").insert(payload).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    toast.success(course ? "Course updated" : "Course created");
    onSaved(data as Course);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{course ? "Edit course" : "New course"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-xs font-medium">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className="text-xs font-medium">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium">Category</label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Foundations, Marketing…" /></div>
            <div>
              <label className="text-xs font-medium">Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><label className="text-xs font-medium">Thumbnail hue (0–360)</label><Input value={hue} onChange={(e) => setHue(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-brand text-primary-foreground border-0">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Modules ===================== */
type Module = { id: string; course_id: string; title: string; description: string | null; order_index: number };

function ModulesPanel({ courseId }: { courseId: string }) {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const { data: modules, isLoading } = useQuery({
    queryKey: ["admin-modules", courseId],
    queryFn: async () => {
      const { data } = await supabase.from("modules" as never).select("*").eq("course_id", courseId).order("order_index");
      return (data ?? []) as unknown as Module[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this module? Lessons inside it will become unassigned.")) return;
    const { error } = await supabase.from("modules" as never).delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-modules", courseId] });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold"><Layers className="h-4 w-4 text-primary" /> Modules</h3>
        <Button size="sm" onClick={() => { setEditing(null); setShowDialog(true); }} className="bg-gradient-brand text-primary-foreground border-0">
          <Plus className="mr-1 h-3.5 w-3.5" />Add module
        </Button>
      </div>

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
        <div className="space-y-3">
          {modules?.map((m) => {
            const open = openIds[m.id] ?? true;
            return (
              <div key={m.id} className="rounded-xl border bg-background/50">
                <div className="flex items-center gap-2 p-3">
                  <button onClick={() => setOpenIds({ ...openIds, [m.id]: !open })} className="text-muted-foreground">
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.order_index + 1}. {m.title}</p>
                    {m.description && <p className="truncate text-xs text-muted-foreground">{m.description}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(m); setShowDialog(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                {open && (
                  <div className="border-t p-3">
                    <LessonsPanel courseId={courseId} moduleId={m.id} />
                  </div>
                )}
              </div>
            );
          })}
          {modules?.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No modules yet. Add your first module to start structuring this course.
            </div>
          )}

          {/* Unassigned lessons */}
          <div className="rounded-xl border border-dashed bg-background/30 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unassigned lessons</p>
            <LessonsPanel courseId={courseId} moduleId={null} />
          </div>
        </div>
      )}

      {showDialog && (
        <ModuleDialog courseId={courseId} module={editing} nextOrder={modules?.length ?? 0} onClose={() => setShowDialog(false)} />
      )}
    </div>
  );
}

function ModuleDialog({ courseId, module, nextOrder, onClose }: { courseId: string; module: Module | null; nextOrder: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(module?.title ?? "");
  const [description, setDescription] = useState(module?.description ?? "");
  const [order, setOrder] = useState(module?.order_index ?? nextOrder);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = { course_id: courseId, title, description, order_index: order };
    const q = module
      ? supabase.from("modules" as never).update(payload as never).eq("id", module.id)
      : supabase.from("modules" as never).insert(payload as never);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-modules", courseId] });
    toast.success(module ? "Module updated" : "Module created");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{module ? "Edit module" : "New module"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-xs font-medium">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className="text-xs font-medium">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
          <div><label className="text-xs font-medium">Order</label><Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-brand text-primary-foreground border-0">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Lessons ===================== */
type Lesson = {
  id: string; course_id: string; module_id: string | null; title: string;
  content: string | null; order_index: number; lesson_type: string;
  duration_minutes: number | null; video_url: string | null; difficulty: string;
};

function LessonsPanel({ courseId, moduleId }: { courseId: string; moduleId: string | null }) {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [quizFor, setQuizFor] = useState<Lesson | null>(null);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons", courseId, moduleId],
    queryFn: async () => {
      let q = supabase.from("lessons").select("*").eq("course_id", courseId);
      q = moduleId ? q.eq("module_id", moduleId) : q.is("module_id", null);
      const { data } = await q.order("order_index");
      return (data ?? []) as unknown as Lesson[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-lessons", courseId, moduleId] });
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Lessons {lessons?.length ? `(${lessons.length})` : ""}</p>
        <Button size="sm" variant="outline" onClick={() => { setEditing(null); setShowDialog(true); }}>
          <Plus className="mr-1 h-3.5 w-3.5" />Add lesson
        </Button>
      </div>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (
        <ul className="space-y-1.5">
          {lessons?.map((l) => (
            <li key={l.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs">
              <span className="font-mono text-muted-foreground">{l.order_index + 1}.</span>
              <span className="min-w-0 flex-1 truncate font-medium">{l.title}</span>
              <Badge variant="outline" className="text-[10px]">{l.lesson_type}</Badge>
              <Button size="sm" variant="ghost" onClick={() => setQuizFor(l)}><HelpCircle className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(l); setShowDialog(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </li>
          ))}
          {lessons?.length === 0 && <p className="py-3 text-center text-xs text-muted-foreground">No lessons here yet.</p>}
        </ul>
      )}

      {showDialog && (
        <LessonDialog courseId={courseId} moduleId={moduleId} lesson={editing} nextOrder={lessons?.length ?? 0} onClose={() => setShowDialog(false)} />
      )}
      {quizFor && <QuizDialog lesson={quizFor} onClose={() => setQuizFor(null)} />}
    </div>
  );
}

function LessonDialog({ courseId, moduleId, lesson, nextOrder, onClose }: { courseId: string; moduleId: string | null; lesson: Lesson | null; nextOrder: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [type, setType] = useState(lesson?.lesson_type ?? "reading");
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? "");
  const [duration, setDuration] = useState(lesson?.duration_minutes ?? 5);
  const [difficulty, setDifficulty] = useState(lesson?.difficulty ?? "beginner");
  const [order, setOrder] = useState(lesson?.order_index ?? nextOrder);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const path = `${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("lesson-media").upload(path, file, { upsert: false });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = await supabase.storage.from("lesson-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    setUploading(false);
    if (data?.signedUrl) { setVideoUrl(data.signedUrl); toast.success("Uploaded"); }
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = { course_id: courseId, module_id: moduleId, title, content, lesson_type: type, video_url: videoUrl || null, duration_minutes: duration, difficulty, order_index: order };
    const q = lesson
      ? supabase.from("lessons").update(payload).eq("id", lesson.id)
      : supabase.from("lessons").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-lessons"] });
    toast.success(lesson ? "Lesson updated" : "Lesson created");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{lesson ? "Edit lesson" : "New lesson"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-xs font-medium">Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium">Minutes</label><Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></div>
          </div>
          <div>
            <label className="text-xs font-medium">Media URL (video / audio / image)</label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://… or upload below" />
            <div className="mt-2">
              <input type="file" accept="video/*,audio/*,image/*" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium" />
              {uploading && <p className="mt-1 text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" />Uploading…</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Content (markdown / plain text)</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Write the lesson content here. Supports plain text and basic markdown." />
          </div>
          <div><label className="text-xs font-medium">Order</label><Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-brand text-primary-foreground border-0">{saving ? "Saving…" : "Save lesson"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Quizzes ===================== */
type Quiz = { id: string; lesson_id: string; question: string; options: string[]; correct_index: number; explanation: string | null; order_index: number };

function QuizDialog({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["admin-quizzes", lesson.id],
    queryFn: async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("lesson_id", lesson.id).order("order_index");
      return (data ?? []) as unknown as Quiz[];
    },
  });

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!question.trim()) return toast.error("Question required");
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (cleaned.length < 2) return toast.error("Need at least 2 options");
    if (correct >= cleaned.length) return toast.error("Correct answer index out of range");
    setSaving(true);
    const { error } = await supabase.from("quizzes").insert({
      lesson_id: lesson.id, question, options: cleaned, correct_index: correct, explanation, order_index: quizzes?.length ?? 0,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-quizzes", lesson.id] });
    setQuestion(""); setOptions(["", "", "", ""]); setCorrect(0); setExplanation("");
    toast.success("Question added");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-quizzes", lesson.id] });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Quiz · {lesson.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Existing questions</p>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : quizzes?.length ? (
            <ul className="space-y-2">
              {quizzes.map((q, i) => (
                <li key={q.id} className="rounded-lg border bg-background/50 p-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-muted-foreground">{i + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{q.question}</p>
                      <p className="mt-1 text-muted-foreground">✓ {q.options[q.correct_index]}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(q.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-muted-foreground">No questions yet.</p>}

          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add question</p>
            <div className="space-y-3">
              <div><label className="text-xs font-medium">Question</label><Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} /></div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Options (click radio for correct answer)</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} />
                    <Input value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  </div>
                ))}
              </div>
              <div><label className="text-xs font-medium">Explanation (optional)</label><Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} /></div>
              <Button onClick={add} disabled={saving} className="bg-gradient-brand text-primary-foreground border-0"><Plus className="mr-1 h-4 w-4" />{saving ? "Adding…" : "Add question"}</Button>
            </div>
          </div>
        </div>

        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
