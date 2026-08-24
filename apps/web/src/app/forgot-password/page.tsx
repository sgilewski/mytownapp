import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export default async function ForgotPassword({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){
  const{error,message}=await searchParams;
  return <main className="auth-page"><form className="auth-card" action={requestPasswordReset}>
    <Link className="wordmark dark" href="/">mytown<span>app</span></Link>
    <p className="eyebrow">Account recovery</p><h1>Reset your password.</h1>
    <p className="form-copy">Enter your email and we’ll send you a secure reset link.</p>
    {error?<p className="form-error">{error}</p>:null}{message?<p className="form-success">{message}</p>:null}
    <label>Email<input name="email" type="email" autoComplete="email" required/></label>
    <button className="primary" type="submit">Send reset link</button>
    <p className="form-copy"><Link href="/login">Back to sign in</Link></p>
  </form></main>;
}
