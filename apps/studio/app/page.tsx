import { Dashboard } from '@/components/dashboard';
import { SignIn } from '@/components/sign-in';
import { getSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';
import { isHostedAuthEnabled } from '@/lib/server/hosted-auth';
import { isLocalAuthEnabled } from '@/lib/server/local-auth';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ accessError?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    const parameters = await searchParams;
    return (
      <SignIn
        accessError={parameters.accessError === '1'}
        hostedAuthEnabled={isHostedAuthEnabled()}
        localAuthEnabled={isLocalAuthEnabled()}
        vercelAuthEnabled={Boolean(
          process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID && process.env.VERCEL_APP_CLIENT_SECRET,
        )}
      />
    );
  }
  const decks = await getStore().listDecks(session.id);
  return <Dashboard session={session} decks={decks} />;
}
