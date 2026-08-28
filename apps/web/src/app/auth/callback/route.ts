import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthDestination } from "@/lib/workspace-access";

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
        const{data:claims}=await supabase.auth.getClaims();
        const userId=claims?.claims?.sub;
        const{data:memberships}=userId?await supabase.from("memberships").select("role").eq("user_id",userId):{data:[]};
        return NextResponse.redirect(new URL(getPostAuthDestination(memberships??[]),request.url));
      }
    }
  }
  return NextResponse.redirect(new URL("/forgot-password?error=That+reset+link+is+invalid+or+has+expired",request.url));
}
