"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthDestination } from "@/lib/workspace-access";

function appUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
}

export async function signIn(formData:FormData){
  const supabase=await createClient();
  if(!supabase)redirect("/login?error=Supabase+is+not+configured");
  const{data,error}=await supabase.auth.signInWithPassword({email:String(formData.get("email")??""),password:String(formData.get("password")??"")});
  if(error)redirect(`/login?error=${encodeURIComponent(error.message)}`);
  const{data:memberships,error:membershipError}=await supabase.from("memberships").select("role").eq("user_id",data.user.id);
  if(membershipError)redirect(`/login?error=${encodeURIComponent("Signed in, but account roles could not be loaded")}`);
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
  if(!supabase)redirect("/signup?error=Supabase+is+not+configured");
  const email=String(formData.get("email")??"").trim().toLowerCase();
  const password=String(formData.get("password")??"");
  const fullName=String(formData.get("fullName")??"").trim();
  const{data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}});
  if(error)redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  if(data.session&&data.user){
    const{data:memberships,error:membershipError}=await supabase.from("memberships").select("role").eq("user_id",data.user.id);
    if(membershipError)redirect(`/login?error=${encodeURIComponent("Account created, but roles could not be loaded")}`);
    redirect(getPostAuthDestination(memberships??[]));
  }
  redirect("/login?message=Check+your+email+to+confirm+your+account");
}
export async function signOut(){const supabase=await createClient();if(supabase)await supabase.auth.signOut();redirect("/login")}
