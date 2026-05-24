import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, BookOpen, Activity, DollarSign, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — JewelIQ Academy" }] }),
});

function AdminDashboard() {
  const { isAdmin, isLoading } = useRoles();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ count: courses }, { count: profiles }, { count: enrollments }] = await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
      ]);
      return { courses: courses ?? 0, users: profiles ?? 0, enrollments: enrollments ?? 0 };
    },
  });

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
    { label: "Total users", value: stats?.users ?? 0, icon: Users },
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold">User management</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Promote users to instructor or admin, view profiles, manage roles.
          </p>
          <Button variant="outline" className="mt-4">Open user list</Button>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold">Reports</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Platform analytics, conversion, engagement, revenue trends.
          </p>
          <Button variant="outline" className="mt-4">View reports</Button>
        </div>
      </div>
    </div>
  );
}
