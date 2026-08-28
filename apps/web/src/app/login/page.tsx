import Link from "next/link";
import { Building2, Landmark } from "lucide-react";
import { signIn } from "@/app/actions/auth";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){
  const{error,message}=await searchParams;
  return <main className="auth-page"><form className="auth-card" action={signIn}>
    <Link className="wordmark dark" href="/">mytown<span>app</span></Link>
    <p className="eyebrow">Dashboard access</p>
    <h1>Welcome back.</h1>
    <p className="form-copy">One account gives you access to every workspace you belong to.</p>
    <div className="role-summary" aria-label="Supported account access">
      <span><Building2 aria-hidden="true"/><strong>Business owner</strong></span>
      <span><Landmark aria-hidden="true"/><strong>Chamber member</strong></span>
      <small>If you’re both, you’ll choose a workspace after signing in.</small>
    </div>
    {error?<p className="form-error">{error}</p>:null}{message?<p className="form-success">{message}</p>:null}
    <label>Email<input name="email" type="email" autoComplete="email" required/></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label>
    <p className="form-copy"><Link href="/forgot-password">Forgot your password?</Link></p>
    <button className="primary" type="submit">Sign in</button>
    <p className="form-copy">New here? <Link href="/signup">Create an account</Link></p>
  </form></main>
}
