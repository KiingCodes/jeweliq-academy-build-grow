import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { downloadCertificate } from "@/lib/certificate-pdf";

export const Route = createFileRoute("/_app/certificates")({
  component: CertificatesPage,
  head: () => ({ meta: [{ title: "Certificates — JewelIQ Academy" }] }),
});

function CertificatesPage() {
  const { user } = useSession();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["certificates", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates" as never)
        .select("id, cert_code, issued_at, course_id, courses(title, slug, thumbnail_hue)")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; cert_code: string; issued_at: string; course_id: string; courses: { title: string; slug: string; thumbnail_hue: string } | null }>;
    },
  });

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Achievements</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Earned when you complete every lesson in a course.</p>
      </div>

      {!data?.length ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Award className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No certificates yet — finish a course to earn one!</p>
          <Button asChild className="bg-gradient-brand text-primary-foreground border-0 mt-4">
            <Link to="/courses">Browse courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {data.map((c) => (
            <div key={c.id} className="glass overflow-hidden rounded-2xl">
              <div className="h-24" style={{ background: `linear-gradient(135deg, oklch(0.75 0.16 ${c.courses?.thumbnail_hue ?? "280"}), oklch(0.55 0.22 ${Number(c.courses?.thumbnail_hue ?? "280") + 30}))` }} />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <Award className="h-7 w-7 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold leading-tight">{c.courses?.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">ID: {c.cert_code}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => downloadCertificate({
                    name: profile?.display_name ?? user?.email?.split("@")[0] ?? "Student",
                    course: c.courses?.title ?? "Course",
                    code: c.cert_code,
                    date: new Date(c.issued_at).toLocaleDateString(),
                  })} className="bg-gradient-brand text-primary-foreground border-0">
                    <Download className="mr-1 h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/verify/$code" params={{ code: c.cert_code }}>
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> Verify
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
