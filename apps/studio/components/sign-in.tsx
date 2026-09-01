import { Triangle } from 'lucide-react';

export function SignIn({
  localAuthEnabled,
  vercelAuthEnabled,
}: {
  localAuthEnabled: boolean;
  vercelAuthEnabled: boolean;
}) {
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
        <div className="signin-actions">
          {localAuthEnabled ? (
            <form action="/api/auth/local-session" method="post">
              <button className="button button-primary button-large" type="submit">
                Open local studio
              </button>
            </form>
          ) : null}
          {vercelAuthEnabled ? (
            <a
              className={`button button-large ${localAuthEnabled ? 'button-secondary' : 'button-primary'}`}
              href="/api/auth/authorize"
            >
              Continue with Vercel
            </a>
          ) : (
            <p className="signin-status">
              Vercel sign-in activates when the internal app credentials are configured.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
