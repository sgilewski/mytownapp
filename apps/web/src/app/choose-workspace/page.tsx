import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, Landmark } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export const dynamic = "force-dynamic";

export default async function ChooseWorkspace(){
  const supabase=await createClient();
  if(!supabase)redirect("/login?error=Supabase+is+not+configured");
  const{data:claims,error:claimsError}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(claimsError||!userId)redirect("/login");
  const{data:memberships,error}=await supabase.from("memberships").select("role").eq("user_id",userId);
  if(error)throw new Error(`Unable to load account roles: ${error.message}`);
  const{hasBusiness,hasChamber}=getWorkspaceAccess(memberships??[]);
  if(hasBusiness&&!hasChamber)redirect("/business");
  if(hasChamber&&!hasBusiness)redirect("/chamber");
  if(!hasBusiness&&!hasChamber)redirect("/unauthorized");

  return <main className="welcome workspace-choice">
    <div className="brand-mark">m</div>
    <p className="eyebrow">Choose your workspace</p>
    <h1>Where would you<br/><em>like to work?</em></h1>
    <p className="lede">Your account has both business and chamber access. Choose the dashboard you want to open.</p>
    <div className="portal-grid">
      <Link href="/business"><Building2/><span><strong>Business dashboard</strong><small>Manage your business, offers, team, and results.</small></span><ArrowRight/></Link>
      <Link href="/chamber"><Landmark/><span><strong>Chamber dashboard</strong><small>Manage members, events, announcements, and town activity.</small></span><ArrowRight/></Link>
    </div>
    <form action={signOut}><button className="workspace-signout" type="submit">Sign in with a different account</button></form>
  </main>
}
