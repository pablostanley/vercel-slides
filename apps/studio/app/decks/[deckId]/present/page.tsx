import { redirect } from 'next/navigation';
import { DeckLoader } from '@/components/deck-loader';
import { getSession } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export default async function PresentPage({ params }: { params: Promise<{ deckId: string }> }) {
  const session = await getSession();
  if (!session) redirect('/');
  const { deckId } = await params;
  return <DeckLoader deckId={deckId} session={session} mode="present" />;
}
