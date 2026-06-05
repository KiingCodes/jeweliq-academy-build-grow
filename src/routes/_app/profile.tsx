import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Upload, Save, KeyRound, LogOut, Mail, Flame, Sparkles, BookOpen, Award, User as UserIcon, Settings, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — JewelIQ Academy" }] }),
});

function ProfilePage() {
  const { user } = useSession();
  const { roles } = useRoles();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ count: enrolled }, { count: certs }, { count: completed }] = await Promise.all([
        supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("certificates" as never).select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("completed", true),
      ]);
      return { enrolled: enrolled ?? 0, certs: certs ?? 0, completed: completed ?? 0 };
    },
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl || null,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    setUploading(false);
    toast.success("Avatar updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const sendPasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const initial = (displayName || user?.email || "U")[0].toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-brand opacity-20" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-end">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-background shadow-glow bg-gradient-brand">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary-foreground">{initial}</div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-soft hover:opacity-90">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{displayName || user?.email?.split("@")[0]}</h1>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{user?.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {roles.length === 0 && <Badge variant="outline">Student</Badge>}
              {roles.map((r) => <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="capitalize">{r}</Badge>)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value={`${profile?.streak_days ?? 0}d`} />
        <StatCard icon={Sparkles} label="XP" value={`${profile?.xp ?? 0}`} />
        <StatCard icon={BookOpen} label="Enrolled" value={`${stats?.enrolled ?? 0}`} />
        <StatCard icon={Award} label="Certificates" value={`${stats?.certs ?? 0}`} />
      </div>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about"><UserIcon className="mr-1 h-3.5 w-3.5" />About me</TabsTrigger>
          <TabsTrigger value="activity"><Trophy className="mr-1 h-3.5 w-3.5" />Activity</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-1 h-3.5 w-3.5" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6 space-y-5">
          <div className="glass space-y-4 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Profile details</h2>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell other founders about yourself, your goals, what you're building…" className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avatar URL</label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://… or upload above" className="mt-1.5" />
            </div>
            <Button onClick={save} disabled={saving} className="bg-gradient-brand text-primary-foreground border-0">
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityPanel userId={user!.id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-5">
          <div className="glass space-y-4 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Account</h2>
            <SettingRow label="Email" value={user?.email ?? ""} />
            <SettingRow label="User ID" value={user?.id.slice(0, 8) + "…"} mono />
            <SettingRow label="Member since" value={new Date(profile?.created_at ?? Date.now()).toLocaleDateString()} />
          </div>
          <div className="glass space-y-3 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Security</h2>
            <Button variant="outline" onClick={sendPasswordReset}><KeyRound className="mr-1 h-4 w-4" />Send password reset email</Button>
          </div>
          <div className="glass space-y-3 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold">Preferences</h2>
            <PrefRow label="Email notifications" desc="Lesson reminders, new course alerts, weekly digest" defaultChecked />
            <PrefRow label="Community digest" desc="Get a summary of top discussions every week" defaultChecked />
            <PrefRow label="Marketing emails" desc="Tips, promotions, and platform updates" />
          </div>
          <div className="glass space-y-3 rounded-2xl border-destructive/40 p-6">
            <h2 className="font-display text-lg font-semibold text-destructive">Danger zone</h2>
            <Button variant="outline" onClick={signOut}><LogOut className="mr-1 h-4 w-4" />Sign out of all devices</Button>
            <p className="text-xs text-muted-foreground">To delete your account, contact support — this will permanently remove all your data.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SettingRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function PrefRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

function ActivityPanel({ userId }: { userId: string }) {
  const { data: recent } = useQuery({
    queryKey: ["activity-recent", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("completed_at, lesson_id, lessons(title, course_id, courses(title, slug))")
        .eq("user_id", userId).eq("completed", true)
        .order("completed_at", { ascending: false }).limit(15);
      return (data ?? []) as any[];
    },
  });

  if (!recent?.length) return <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No activity yet — complete your first lesson!</div>;
  return (
    <div className="glass divide-y rounded-2xl">
      {recent.map((r, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="bg-gradient-brand flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.lessons?.title}</p>
            <p className="text-xs text-muted-foreground">{r.lessons?.courses?.title} · {r.completed_at ? new Date(r.completed_at).toLocaleString() : ""}</p>
          </div>
          <Badge variant="outline">+25 XP</Badge>
        </div>
      ))}
    </div>
  );
}
