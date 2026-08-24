import { redirect } from "next/navigation";
import type { AppRole } from "@mytownapp/types";
import { createClient } from "@/lib/supabase/server";

export async function requireRole(roles: AppRole[]) {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, userId: null, userName: "Demo user", demo: true as const, memberships: [] };

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) redirect("/login");

  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("role,business_id,chamber_id")
    .eq("user_id", userId);
  if (membershipError) throw new Error(`Unable to load account roles: ${membershipError.message}`);
  if (!memberships?.some((membership) => roles.includes(membership.role as AppRole))) redirect("/unauthorized");

  const metadata = claimsData.claims.user_metadata as { full_name?: string } | undefined;
  const userName = metadata?.full_name?.trim() || String(claimsData.claims.email ?? "Member").split("@")[0];
  return { supabase, userId, userName, memberships: memberships ?? [], demo: false as const };
}
