import { Dashboard } from '@/components/dashboard';
import { SignIn } from '@/components/sign-in';
import { getSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  if (!session) return <SignIn />;
  const decks = await getStore().listDecks(session.id);
  return <Dashboard session={session} decks={decks} />;
}
