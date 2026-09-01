# Vercel Slides Studio

The hosted studio can run as a loopback-only local authoring workspace until the Internal
Playground Sign in with Vercel app is available.

## Local authoring

Pull the linked project's development variables once so edits use the provisioned Neon database
and Vercel Blob store:

```bash
cd apps/studio
pnpm dlx vercel@latest env pull .env.local --scope vercel-internal-playground
cd ../..
```

Start the studio from the repository root:

```bash
pnpm dev:studio
```

Open `http://127.0.0.1:3100` and select **Open local studio**. The server binds only to the
loopback interface. Local sign-in also checks for a same-origin loopback request and is disabled
whenever `NODE_ENV=production`.

`DATABASE_URL` makes local edits durable in Neon. Without it, development falls back to memory and
restarting the server clears the local workspace.

The default local identity is an admin so the master library can be edited. Override it in
`.env.local` with `STUDIO_LOCAL_USER_ID`, `STUDIO_LOCAL_USER_EMAIL`, `STUDIO_LOCAL_USER_NAME`, and
`STUDIO_LOCAL_USER_ROLE` when needed.

## Enable hosted authentication later

Create the Vercel App under the Internal Playground team, add the production and local callback
URLs, enable only `openid`, `email`, and `profile`, and set these project variables:

```text
NEXT_PUBLIC_VERCEL_APP_CLIENT_ID
VERCEL_APP_CLIENT_SECRET
STUDIO_SESSION_SECRET
ALLOWED_EMAIL_DOMAINS
ADMIN_VERCEL_USER_IDS
```

The Vercel OIDC routes, verified ID-token flow, production allow policy, and server-side admin
checks remain active in the same application. No local-auth setting can enable the local adapter in
production.
