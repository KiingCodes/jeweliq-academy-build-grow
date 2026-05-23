import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create your account — JewelIQ Academy" }] }),
});

const schema = z.object({
  displayName: z.string().trim().min(2, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function SignupPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ displayName, email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created — welcome to JewelIQ!");
    navigate({ to: "/dashboard" });
  };

  return <AuthShell title="Start learning today" subtitle="Free forever plan. No credit card required.">
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoComplete="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
      </div>
      <Button type="submit" disabled={loading} className="bg-gradient-brand w-full text-primary-foreground border-0">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create account
      </Button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
    </p>
  </AuthShell>;
}
