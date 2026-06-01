import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Shield,
  Users,
  BookOpen,
  Activity,
  DollarSign,
  Loader2,
  Lock,
  Megaphone,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — JewelIQ Academy" }] }),
});

function AdminDashboard() {
  const { isAdmin, isLoading } = useRoles();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ count: courses }, { count: profiles }, { count: enrollments }, { count: certs }] =
        await Promise.all([
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("enrollments").select("*", { count: "exact", head: true }),
          supabase.from("certificates").select("*", { count: "exact", head: true }),
        ]);
      return {
        courses: courses ?? 0,
        users: profiles ?? 0,
        enrollments: enrollments ?? 0,
        certs: certs ?? 0,
      };
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, xp, streak_days, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map<string, string[]>();
      roles?.forEach((r) => {
        const list = roleMap.get(r.user_id) ?? [];
        list.push(r.role);
        roleMap.set(r.user_id, list);
      });
      return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses"],
    enabled: isAdmin,
    queryFn: async () =>
      (await supabase.from("courses").select("*").order("created_at", { ascending: false })).data ??
      [],
  });

  const promote = async (userId: string, role: "instructor" | "admin") => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success(`Promoted to ${role}`);
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("courses").update({ is_published: !current }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  };

  // announcement
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  const postAnn = async () => {
    if (!annTitle.trim()) return;

    const { error } = await supabase.from("announcements").insert([
      {
        title: annTitle,
        body: annBody,
      },
    ]);

    if (error) {
      toast.error(error.message);
      return;
    }

    setAnnTitle("");
    setAnnBody("");
    toast.success("Announcement published");
  };

  // enroll students
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
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to platform administrators.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
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
          <h1 className="font-display text-3xl font-semibold tracking-tight">Platform overview</h1>
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

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enroll">Enroll</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

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
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">XP</th>
                  <th className="p-3 text-left">Streak</th>
                  <th className="p-3 text-left">Roles</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="p-3">{u.display_name ?? "—"}</td>
                    <td className="p-3">{u.xp}</td>
                    <td className="p-3">{u.streak_days}d</td>
                    <td className="p-3">
                      <span className="text-xs">{u.roles.join(", ") || "student"}</span>
                    </td>
                    <td className="p-3 text-right">
                      {!u.roles.includes("instructor") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => promote(u.id, "instructor")}
                        >
                          + Instructor
                        </Button>
                      )}
                      {!u.roles.includes("admin") && (
                        <Button size="sm" variant="ghost" onClick={() => promote(u.id, "admin")}>
                          + Admin
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-4">
          <div className="space-y-2">
            {courses?.map((c) => (
              <div key={c.id} className="glass flex items-center justify-between rounded-xl p-3">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.category} · {c.level}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePublish(c.id, c.is_published)}
                >
                  {c.is_published ? "Unpublish" : "Publish"}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <div className="glass space-y-3 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Post announcement</h3>
            </div>
            <Input
              placeholder="Title"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
            />
            <Textarea
              placeholder="Message"
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              rows={3}
            />
            <Button
              onClick={postAnn}
              className="bg-gradient-brand text-primary-foreground border-0"
            >
              <Plus className="mr-1 h-4 w-4" />
              Publish
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">Platform settings</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Branding, billing, integrations, and limits.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-3 text-sm">
                <strong>Total certificates issued:</strong> {stats?.certs ?? 0}
              </div>
              <div className="rounded-xl border p-3 text-sm">
                <strong>Active platform:</strong> Lovable Cloud
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
