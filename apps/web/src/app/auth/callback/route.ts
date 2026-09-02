import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get("code");
  const requestedEmail=request.nextUrl.searchParams.get("email")?.trim().toLowerCase()??"";
  const email=requestedEmail.length<=254&&requestedEmail.includes("@")?requestedEmail:"";
  const requestedNext=request.nextUrl.searchParams.get("next");
  const next=requestedNext==="/reset-password"?requestedNext:null;
  if(code){
    const supabase=await createClient();
    if(supabase){
      const{error}=await supabase.auth.exchangeCodeForSession(code);
      if(!error){
        if(next)return NextResponse.redirect(new URL(next,request.url));
        await supabase.auth.signOut();
        const loginUrl=new URL("/login",request.url);
        loginUrl.searchParams.set("message","Email confirmed. You can sign in now.");
        if(email)loginUrl.searchParams.set("email",email);
        return NextResponse.redirect(loginUrl);
      }
    }
  }
  const errorPath=next
    ?"/forgot-password?error=That+reset+link+is+invalid+or+has+expired"
    :"/login?message=Your+email+is+confirmed.+Sign+in+to+continue.";
  const errorUrl=new URL(errorPath,request.url);
  if(email&&!next)errorUrl.searchParams.set("email",email);
  return NextResponse.redirect(errorUrl);
}
