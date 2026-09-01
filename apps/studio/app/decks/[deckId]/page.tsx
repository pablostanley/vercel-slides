import { redirect } from 'next/navigation';
import { DeckLoader } from '@/components/deck-loader';
import { getSession } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export default async function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const session = await getSession();
  if (!session) redirect('/');
  const { deckId } = await params;
  const testAssetUploads =
    process.env.NODE_ENV !== 'production' && process.env.STUDIO_TEST_AUTH === '1';
  return <DeckLoader deckId={deckId} session={session} testAssetUploads={testAssetUploads} />;
}
