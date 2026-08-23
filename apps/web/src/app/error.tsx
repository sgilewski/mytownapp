"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="welcome"><p className="eyebrow">Something went sideways</p><h1>Let’s try that <em>once more.</em></h1><button className="primary" onClick={reset}>Try again</button></main>; }
