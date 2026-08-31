export default async function CheckEmail({searchParams}:{searchParams:Promise<{email?:string}>}){
  const{email}=await searchParams;
  return <main className="auth-page"><section className="auth-card">
    <div className="wordmark dark">mytown<span>app</span></div>
    <p className="eyebrow">One last step</p>
    <h1>Check your email.</h1>
    <p className="form-copy">We sent a confirmation link{email?<> to <strong>{email}</strong></>:null}. Open it to confirm your account.</p>
    <p className="form-copy">After confirming, you’ll return to mytownapp and sign in with the password you just created.</p>
  </section></main>
}
