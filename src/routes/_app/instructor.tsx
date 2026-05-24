import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users, BookOpen, DollarSign, Plus, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/instructor")({
  component: InstructorDashboard,
  head: () => ({ meta: [{ title: "Instructor — JewelIQ Academy" }] }),
});

function InstructorDashboard() {
  const { isInstructor, isAdmin, isLoading } = useRoles();

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

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;

  if (!isInstructor && !isAdmin) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="font-display mt-4 text-xl font-semibold">Instructor access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need the instructor role to access this dashboard. Contact an admin to be upgraded.
        </p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  const tiles = [
    { label: "Your courses", value: stats?.courses ?? 0, icon: BookOpen },
    { label: "Total students", value: stats?.students ?? 0, icon: Users },
    { label: "Lessons published", value: stats?.lessons ?? 0, icon: GraduationCap },
    { label: "Earnings (mo)", value: "$0", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Instructor</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Teach what you love</h1>
        </div>
        <Button className="bg-gradient-warm text-white border-0"><Plus className="mr-1 h-4 w-4" />New course</Button>
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

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold">Create your first course</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Build a curriculum, upload lessons, and start earning. Full authoring tools coming next.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Course details", "Upload lessons", "Publish"].map((s, i) => (
            <div key={s} className="rounded-xl border bg-card/60 p-4">
              <p className="text-xs text-muted-foreground">Step {i + 1}</p>
              <p className="mt-1 text-sm font-medium">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
