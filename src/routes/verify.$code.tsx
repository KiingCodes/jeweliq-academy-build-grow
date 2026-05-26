import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/verify/$code")({
  component: VerifyPage,
  head: ({ params }) => ({ meta: [{ title: `Verify ${params.code} — JewelIQ Academy` }] }),
});

function VerifyPage() {
  const { code } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["verify", code],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates" as never)
        .select("cert_code, issued_at, user_id, courses(title), profiles:user_id(display_name)")
        .eq("cert_code", code)
        .maybeSingle();
      return data as { cert_code: string; issued_at: string; courses: { title: string } | null; profiles: { display_name: string } | null } | null;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/60 px-6 py-4">
        <Link to="/"><Logo className="h-8 w-auto" /></Link>
      </header>
      <main className="mx-auto max-w-xl px-6 py-16">
        {isLoading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        ) : data ? (
          <div className="glass rounded-3xl p-8 text-center shadow-glow">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="font-display mt-4 text-2xl font-semibold">Certificate verified</h1>
            <div className="mt-6 space-y-3 text-left">
              <Row label="Recipient" value={data.profiles?.display_name ?? "Student"} />
              <Row label="Course" value={data.courses?.title ?? "—"} />
              <Row label="Issued on" value={new Date(data.issued_at).toLocaleDateString()} />
              <Row label="Certificate ID" value={data.cert_code} mono />
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Award className="h-4 w-4" /> Issued by JewelIQ Academy
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="font-display mt-4 text-2xl font-semibold">Not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">No certificate matches code <code className="font-mono">{code}</code>.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background/60 px-4 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
