"use server";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthDestination } from "@/lib/workspace-access";

function appUrl() {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  return "http://localhost:3000";
}

export async function signIn(formData:FormData){
  const supabase=await createClient();
  if(!supabase)redirect("/login?error=Supabase+is+not+configured");
  const{data,error}=await supabase.auth.signInWithPassword({email:String(formData.get("email")??""),password:String(formData.get("password")??"")});
  if(error)redirect(`/login?error=${encodeURIComponent(error.message)}`);
  const{data:memberships,error:membershipError}=await supabase.from("memberships").select("role").eq("user_id",data.user.id);
  if(membershipError)redirect(`/login?error=${encodeURIComponent("Signed in, but account roles could not be loaded")}`);
  const next=String(formData.get("next")??"");
  if(next.startsWith("/accept-invitation?token="))redirect(next);
  redirect(getPostAuthDestination(memberships??[]));
}
export async function requestPasswordReset(formData:FormData){
  const supabase=await createClient();
  if(!supabase)redirect("/forgot-password?error=Supabase+is+not+configured");
  const email=String(formData.get("email")??"").trim().toLowerCase();
  const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${appUrl()}/auth/callback?next=/reset-password`});
  if(error)redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/forgot-password?message=If+an+account+exists+for+that+email%2C+a+reset+link+is+on+the+way.");
}
export async function updatePassword(formData:FormData){
  const supabase=await createClient();
  if(!supabase)redirect("/reset-password?error=Supabase+is+not+configured");
  const password=String(formData.get("password")??"");
  const confirmation=String(formData.get("confirmation")??"");
  if(password.length<8)redirect("/reset-password?error=Password+must+be+at+least+8+characters");
  if(password!==confirmation)redirect("/reset-password?error=Passwords+do+not+match");
  const{data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub)redirect("/forgot-password?error=That+reset+link+is+invalid+or+has+expired");
  const{error}=await supabase.auth.updateUser({password});
  if(error)redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  await supabase.auth.signOut();
  redirect("/login?message=Password+updated.+You+can+sign+in+now.");
}
export async function signUp(formData:FormData){
  const supabase=await createClient();
  const token=String(formData.get("token")??"");
  const signupUrl=`/signup?token=${encodeURIComponent(token)}`;
  if(!supabase)redirect(`${signupUrl}&error=Supabase+is+not+configured`);
  if(!/^[a-f0-9]{64}$/.test(token))redirect("/signup?error=A+valid+invitation+is+required");
  const tokenHash=createHash("sha256").update(token).digest("hex");
  const{data:invitations,error:invitationError}=await supabase.rpc("get_invitation_details",{p_token_hash:tokenHash});
  const invitation=invitations?.[0];
  if(invitationError||!invitation)redirect("/signup?error=That+invitation+is+invalid+or+has+expired");
  const email=String(invitation.email).trim().toLowerCase();
  const password=String(formData.get("password")??"");
  const confirmation=String(formData.get("confirmation")??"");
  const fullName=String(formData.get("fullName")??"").trim();
  if(fullName.length<2)redirect(`${signupUrl}&error=Please+enter+your+full+name`);
  if(password.length<8)redirect(`${signupUrl}&error=Password+must+be+at+least+8+characters`);
  if(password!==confirmation)redirect(`${signupUrl}&error=Passwords+do+not+match`);
  const{data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName,invitation_token_hash:tokenHash},emailRedirectTo:`${appUrl()}/auth/callback`}});
  if(error)redirect(`${signupUrl}&error=${encodeURIComponent(error.message)}`);
  if(data.session&&data.user){
    const{data:memberships,error:membershipError}=await supabase.from("memberships").select("role").eq("user_id",data.user.id);
    if(membershipError)redirect(`/login?error=${encodeURIComponent("Account created, but roles could not be loaded")}`);
    redirect(getPostAuthDestination(memberships??[]));
  }
  redirect("/login?message=Check+your+email+to+confirm+your+account");
}
export async function signOut(){const supabase=await createClient();if(supabase)await supabase.auth.signOut();redirect("/login")}

export async function acceptInvitation(formData:FormData){
  const supabase=await createClient();
  const token=String(formData.get("token")??"");
  if(!supabase)redirect("/login?error=Supabase+is+not+configured");
  if(!/^[a-f0-9]{64}$/.test(token))redirect("/signup?error=A+valid+invitation+is+required");
  const tokenHash=createHash("sha256").update(token).digest("hex");
  const{error}=await supabase.rpc("accept_invitation",{p_token_hash:tokenHash});
  if(error)redirect(`/accept-invitation?token=${token}&error=${encodeURIComponent(error.message)}`);
  const{data:claims}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  const{data:memberships}=userId?await supabase.from("memberships").select("role").eq("user_id",userId):{data:[]};
  redirect(getPostAuthDestination(memberships??[]));
}
