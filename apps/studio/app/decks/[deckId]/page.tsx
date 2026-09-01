import { notFound, redirect } from 'next/navigation';
import { FoundationEditor } from '@/components/foundation-editor';
import { getSession } from '@/lib/server/auth';
import { getStore } from '@/lib/server/get-store';

export const dynamic = 'force-dynamic';

export default async function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const session = await getSession();
  if (!session) redirect('/');
  const { deckId } = await params;
  const access = await getStore().getDeckAccess(session.id, deckId);
  if (!access) notFound();
  return <FoundationEditor session={session} access={access} />;
}
