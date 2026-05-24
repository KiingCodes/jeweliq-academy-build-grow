import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { GoogleButton } from "@/components/GoogleButton";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — JewelIQ Academy" }] }),
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to continue learning.">
    <GoogleButton label="Sign in with Google" />
    <Divider />
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot?</Link>
        </div>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={loading} className="bg-gradient-brand w-full text-primary-foreground border-0">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign in
      </Button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
    </p>
  </AuthShell>;
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
      <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(60% 50% at 50% 0%, oklch(0.55 0.2 260 / 0.25), transparent 70%), radial-gradient(40% 40% at 80% 80%, oklch(0.72 0.19 52 / 0.2), transparent 70%)" }} />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center">
          <Logo className="h-10 w-auto" />
        </Link>
        <div className="glass rounded-2xl p-8 shadow-glow">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
