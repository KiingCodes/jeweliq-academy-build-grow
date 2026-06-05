import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MessageCircle, Heart, Send, Megaphone, Loader2, Plus, Users as UsersIcon, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/community")({
  component: CommunityPage,
  head: () => ({ meta: [{ title: "Student Discussions — JewelIQ Academy" }] }),
});

function CommunityPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await supabase.from("announcements" as never).select("*").order("created_at", { ascending: false }).limit(3)).data as Array<{ id: string; title: string; body: string; created_at: string }> | null ?? [],
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["discussions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("discussions" as never)
        .select("id, title, body, created_at, user_id, profiles:user_id(display_name, avatar_url), comments(count), reactions(count)")
        .order("created_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; title: string; body: string; created_at: string; user_id: string; profiles: { display_name: string; avatar_url: string | null } | null; comments: { count: number }[]; reactions: { count: number }[] }>;
    },
  });

  const submit = async () => {
    if (!user || !title.trim()) return;
    const { error } = await supabase.from("discussions" as never).insert([{ user_id: user.id, title, body }] as any);
    if (error) return toast.error(error.message);
    setTitle(""); setBody(""); setOpen(false);
    qc.invalidateQueries({ queryKey: ["discussions"] });
    toast.success("Posted!");
  };

  return (
    <div className="space-y-6">
      <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Community</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Student discussions</h1>
            <p className="mt-1 text-sm text-muted-foreground">Connect with fellow founders, share wins, ask questions.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button onClick={() => setOpen((o) => !o)} className="bg-gradient-brand text-primary-foreground border-0">
              <Plus className="mr-1 h-4 w-4" /> New post
            </Button>
          </div>
        </div>
      </div>

      {!!announcements?.length && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="glass flex items-start gap-3 rounded-2xl border-l-4 border-primary p-4">
              <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="discussions">
        <TabsList>
          <TabsTrigger value="discussions"><MessageSquare className="mr-1 h-3.5 w-3.5" />Discussions</TabsTrigger>
          <TabsTrigger value="members"><UsersIcon className="mr-1 h-3.5 w-3.5" />Members</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="mt-4 space-y-3">
          {open && (
            <div className="glass space-y-3 rounded-2xl p-5">
              <Input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Share details, questions, wins…" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} className="bg-gradient-brand text-primary-foreground border-0"><Send className="mr-1 h-4 w-4" />Post</Button>
              </div>
            </div>
          )}

          {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : posts?.length ? (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">Be the first to start a discussion.</div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersDirectory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostCard({ post }: { post: { id: string; title: string; body: string; created_at: string; profiles: { display_name: string; avatar_url: string | null } | null; comments: { count: number }[]; reactions: { count: number }[] } }) {
  const { user } = useSession();
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", post.id],
    enabled: showComments,
    queryFn: async () => {
      const { data } = await supabase
        .from("comments" as never)
        .select("id, body, created_at, profiles:user_id(display_name, avatar_url)")
        .eq("discussion_id", post.id)
        .order("created_at");
      return (data ?? []) as Array<{ id: string; body: string; created_at: string; profiles: { display_name: string; avatar_url: string | null } | null }>;
    },
  });

  const react = async () => {
    if (!user) return;
    await supabase.from("reactions" as never).insert([{ user_id: user.id, discussion_id: post.id, emoji: "❤️" }] as any);
    qc.invalidateQueries({ queryKey: ["discussions"] });
  };

  const postComment = async () => {
    if (!user || !comment.trim()) return;
    await supabase.from("comments" as never).insert([{ user_id: user.id, discussion_id: post.id, body: comment }] as any);
    setComment("");
    qc.invalidateQueries({ queryKey: ["comments", post.id] });
    qc.invalidateQueries({ queryKey: ["discussions"] });
  };

  const avatar = post.profiles?.avatar_url;
  const initial = (post.profiles?.display_name?.[0] ?? "U").toUpperCase();

  return (
    <article className="glass rounded-2xl p-5 transition hover:shadow-glow">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="bg-gradient-brand flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-primary-foreground">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initial}
        </div>
        <span className="font-medium text-foreground">{post.profiles?.display_name ?? "Member"}</span>
        <span>· {new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <h3 className="font-display mt-2 text-lg font-semibold">{post.title}</h3>
      {post.body && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{post.body}</p>}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <button onClick={react} className="inline-flex items-center gap-1 hover:text-foreground"><Heart className="h-3.5 w-3.5" /> {post.reactions?.[0]?.count ?? 0}</button>
        <button onClick={() => setShowComments((s) => !s)} className="inline-flex items-center gap-1 hover:text-foreground"><MessageCircle className="h-3.5 w-3.5" /> {post.comments?.[0]?.count ?? 0}</button>
      </div>
      {showComments && (
        <div className="mt-3 space-y-2 border-t pt-3">
          {comments?.map((c) => (
            <div key={c.id} className="flex gap-2 rounded-lg bg-background/60 p-2 text-sm">
              <div className="bg-gradient-brand mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-primary-foreground">
                {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} alt="" className="h-full w-full object-cover" /> : (c.profiles?.display_name?.[0] ?? "U").toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium">{c.profiles?.display_name ?? "Member"}</p>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" className="h-8 text-sm" />
            <Button size="sm" onClick={postComment}>Send</Button>
          </div>
        </div>
      )}
    </article>
  );
}

function MembersDirectory() {
  const { data: members, isLoading } = useQuery({
    queryKey: ["community-members"],
    queryFn: async () => {
      // get distinct enrolled user ids
      const { data: enrolls } = await supabase.from("enrollments").select("user_id");
      const ids = Array.from(new Set((enrolls ?? []).map((e: any) => e.user_id)));
      if (!ids.length) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url, bio, xp, streak_days").in("id", ids);
      return (profiles ?? []).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
    },
  });

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (!members?.length) return <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No enrolled members yet.</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => {
        const initial = (m.display_name ?? "U")[0].toUpperCase();
        return (
          <div key={m.id} className="glass rounded-2xl p-5 transition hover:shadow-glow">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-brand flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-semibold text-primary-foreground">
                {m.avatar_url ? <img src={m.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display truncate text-base font-semibold">{m.display_name ?? "Member"}</h3>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="gap-1 text-[10px]"><Sparkles className="h-2.5 w-2.5" />{m.xp ?? 0} XP</Badge>
                  <Badge variant="outline" className="text-[10px]">🔥 {m.streak_days ?? 0}d</Badge>
                </div>
              </div>
            </div>
            {m.bio && <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">{m.bio}</p>}
          </div>
        );
      })}
    </div>
  );
}
