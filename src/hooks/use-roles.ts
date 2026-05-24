import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export type AppRole = "student" | "instructor" | "admin";

export function useRoles() {
  const { user } = useSession();
  const q = useQuery({
    queryKey: ["user-roles", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AppRole[]> => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });
  return {
    roles: q.data ?? [],
    isLoading: q.isLoading,
    isAdmin: (q.data ?? []).includes("admin"),
    isInstructor: (q.data ?? []).includes("instructor"),
  };
}
