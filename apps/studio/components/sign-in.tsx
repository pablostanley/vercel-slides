import { Triangle } from 'lucide-react';

export function SignIn({
  accessError,
  hostedAuthEnabled,
  localAuthEnabled,
  vercelAuthEnabled,
}: {
  accessError: boolean;
  hostedAuthEnabled: boolean;
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
          {hostedAuthEnabled ? (
            <form className="signin-access-form" action="/api/auth/hosted-session" method="post">
              <label htmlFor="studio-access-code">Studio access code</label>
              <input
                id="studio-access-code"
                className="signin-access-input"
                name="accessCode"
                type="password"
                autoComplete="current-password"
                minLength={32}
                required
              />
              <button className="button button-primary button-large" type="submit">
                Open hosted studio
              </button>
              {accessError ? (
                <p className="signin-error" role="alert">
                  That access code did not match.
                </p>
              ) : (
                <p className="signin-status">Protected by Vercel and a Studio access code.</p>
              )}
            </form>
          ) : null}
          {localAuthEnabled ? (
            <form action="/api/auth/local-session" method="post">
              <button className="button button-primary button-large" type="submit">
                Open local studio
              </button>
            </form>
          ) : null}
          {vercelAuthEnabled ? (
            <a
              className={`button button-large ${localAuthEnabled || hostedAuthEnabled ? 'button-secondary' : 'button-primary'}`}
              href="/api/auth/authorize"
            >
              Continue with Vercel
            </a>
          ) : !localAuthEnabled && !hostedAuthEnabled ? (
            <p className="signin-status">
              Vercel sign-in activates when the internal app credentials are configured.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
