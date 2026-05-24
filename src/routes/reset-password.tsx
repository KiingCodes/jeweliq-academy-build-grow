import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Set new password — JewelIQ Academy" }] }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("At least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose something secure you'll remember.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={loading} className="bg-gradient-brand w-full text-primary-foreground border-0">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update password
        </Button>
      </form>
    </AuthShell>
  );
}
