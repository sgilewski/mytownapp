import Link from "next/link";
import { redirect } from "next/navigation";
import { updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { PasswordField } from "@/components/password-field";

export default async function ResetPassword({searchParams}:{searchParams:Promise<{error?:string}>}){
  const{error}=await searchParams;
  const supabase=await createClient();
  if(!supabase)redirect("/forgot-password?error=Supabase+is+not+configured");
  const{data}=await supabase.auth.getClaims();
  if(!data?.claims?.sub)redirect("/forgot-password?error=That+reset+link+is+invalid+or+has+expired");
  return <main className="auth-page"><form className="auth-card" action={updatePassword}>
    <Link className="wordmark dark" href="/">mytown<span>app</span></Link>
    <p className="eyebrow">Account recovery</p><h1>Choose a new password.</h1>
    <p className="form-copy">Use at least eight characters and confirm it below.</p>
    {error?<p className="form-error">{error}</p>:null}
    <PasswordField label="New password" name="password" autoComplete="new-password"/>
    <PasswordField label="Confirm password" name="confirmation" autoComplete="new-password"/>
    <button className="primary" type="submit">Update password</button>
  </form></main>;
}
