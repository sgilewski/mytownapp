import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get("code");
  const requestedNext=request.nextUrl.searchParams.get("next");
  const next=requestedNext==="/reset-password"?requestedNext:null;
  if(code){
    const supabase=await createClient();
    if(supabase){
      const{error}=await supabase.auth.exchangeCodeForSession(code);
      if(!error){
        if(next)return NextResponse.redirect(new URL(next,request.url));
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?message=Email+confirmed.+You+can+sign+in+now.",request.url));
      }
    }
  }
  const errorPath=next
    ?"/forgot-password?error=That+reset+link+is+invalid+or+has+expired"
    :"/login?message=Your+email+may+already+be+confirmed.+Try+signing+in.";
  return NextResponse.redirect(new URL(errorPath,request.url));
}
