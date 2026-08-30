import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { PasswordField } from "@/components/password-field";

export default async function Login({searchParams}:{searchParams:Promise<{error?:string;message?:string;next?:string}>}){
  const{error,message,next=""}=await searchParams;
  return <main className="auth-page"><form className="auth-card" action={signIn}>
    <Link className="wordmark dark" href="/">mytown<span>app</span></Link>
    <p className="eyebrow">Dashboard access</p>
    <h1>Welcome back.</h1>
    <p className="form-copy">Sign in to continue to your mytownapp workspace.</p>
    {error?<p className="form-error">{error}</p>:null}{message?<p className="form-success">{message}</p>:null}
    {next?<input type="hidden" name="next" value={next}/>:null}
    <label>Email<input name="email" type="email" autoComplete="email" required/></label>
    <PasswordField label="Password" name="password" autoComplete="current-password"/>
    <p className="form-copy"><Link href="/forgot-password">Forgot your password?</Link></p>
    <button className="primary" type="submit">Sign in</button>
    <p className="form-copy">New here? You’ll create your account from the invitation sent by your chamber.</p>
  </form></main>
}
