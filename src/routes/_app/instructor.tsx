import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GraduationCap, Users, BookOpen, DollarSign, Plus, Loader2, Lock, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/instructor")({
  component: InstructorDashboard,
  head: () => ({ meta: [{ title: "Instructor — JewelIQ Academy" }] }),
});

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function InstructorDashboard() {
  const { isInstructor, isAdmin, isLoading } = useRoles();
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["instructor-stats"],
    enabled: isInstructor || isAdmin,
    queryFn: async () => {
      const [{ count: courses }, { count: students }, { count: lessons }] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
      ]);
      return { courses: courses ?? 0, students: students ?? 0, lessons: lessons ?? 0 };
    },
  });

  const { data: myCourses } = useQuery({
    queryKey: ["all-courses-instructor"],
    enabled: isInstructor || isAdmin,
    queryFn: async () => (await supabase.from("courses").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  // Create course form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState("beginner");
  const [description, setDescription] = useState("");
  const [hue, setHue] = useState("280");

  const createCourse = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("courses").insert({
      title, slug: slugify(title), category, level, description, thumbnail_hue: hue, is_published: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Course created!");
    setTitle(""); setDescription("");
    qc.invalidateQueries({ queryKey: ["all-courses-instructor"] });
  };

  // Add lesson
  const [lessonCourse, setLessonCourse] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonType, setLessonType] = useState("reading");

  const addLesson = async () => {
    if (!lessonCourse || !lessonTitle.trim()) return;
    const { count } = await supabase.from("lessons").select("*", { count: "exact", head: true }).eq("course_id", lessonCourse);
    const { error } = await supabase.from("lessons").insert({
      course_id: lessonCourse, title: lessonTitle, content: lessonContent || null,
      video_url: lessonVideo || null, lesson_type: lessonType, order_index: count ?? 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Lesson added!");
    setLessonTitle(""); setLessonContent(""); setLessonVideo("");
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;

  if (!isInstructor && !isAdmin) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="font-display mt-4 text-xl font-semibold">Instructor access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">Contact an admin to be upgraded to instructor.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  const tiles = [
    { label: "Courses", value: stats?.courses ?? 0, icon: BookOpen },
    { label: "Students", value: stats?.students ?? 0, icon: Users },
    { label: "Lessons", value: stats?.lessons ?? 0, icon: GraduationCap },
    { label: "Earnings (mo)", value: "$0", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Instructor</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Teach what you love</h1>
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

      <Tabs defaultValue="create-course">
        <TabsList>
          <TabsTrigger value="create-course"><Plus className="mr-1 h-3.5 w-3.5" />New course</TabsTrigger>
          <TabsTrigger value="add-lesson"><FileText className="mr-1 h-3.5 w-3.5" />Add lesson</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create-course" className="mt-4">
          <div className="glass space-y-3 rounded-2xl p-5">
            <Input placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
              <Input placeholder="Hue (0-360)" value={hue} onChange={(e) => setHue(e.target.value)} />
            </div>
            <Button onClick={createCourse} className="bg-gradient-brand text-primary-foreground border-0">Create course</Button>
          </div>
        </TabsContent>

        <TabsContent value="add-lesson" className="mt-4">
          <div className="glass space-y-3 rounded-2xl p-5">
            <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={lessonCourse} onChange={(e) => setLessonCourse(e.target.value)}>
              <option value="">Select a course…</option>
              {myCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <Input placeholder="Lesson title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            <Textarea placeholder="Lesson content (markdown-friendly text)" value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} rows={5} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Video URL (optional)" value={lessonVideo} onChange={(e) => setLessonVideo(e.target.value)} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={lessonType} onChange={(e) => setLessonType(e.target.value)}>
                <option value="reading">Reading</option><option value="video">Video</option><option value="code">Code challenge</option>
              </select>
            </div>
            <Button onClick={addLesson} className="bg-gradient-brand text-primary-foreground border-0">Add lesson</Button>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-4">
          <div className="space-y-2">
            {myCourses?.map((c) => (
              <Link key={c.id} to="/courses/$slug" params={{ slug: c.slug }} className="glass flex items-center justify-between rounded-xl p-4 hover:shadow-glow">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.category} · {c.level}</p>
                </div>
                <span className="text-xs text-primary">Open →</span>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">Analytics</h3>
            <p className="mt-2 text-sm text-muted-foreground">Total enrollments: <strong>{stats?.students ?? 0}</strong> · Lessons published: <strong>{stats?.lessons ?? 0}</strong></p>
            <p className="mt-1 text-xs text-muted-foreground">Detailed cohort & funnel analytics rolling out next.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
