import { Triangle } from 'lucide-react';

export function SignIn() {
  return (
    <main className="signin-shell">
      <section className="signin-card" aria-labelledby="signin-title">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden>
            <Triangle fill="currentColor" strokeWidth={0} />
          </span>
          <span>Vercel Slides</span>
        </div>
        <div className="signin-copy">
          <p className="eyebrow">Internal presentation studio</p>
          <h1 id="signin-title">Build the story, not the slide system.</h1>
          <p>Create from Vercel masters, edit together, and present from one durable workspace.</p>
        </div>
        <a className="button button-primary button-large" href="/api/auth/authorize">
          Continue with Vercel
        </a>
      </section>
    </main>
  );
}
