'use client';

import { useEffect, useState } from 'react';
import type { DeckAccess } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';
import { PresentationPlayer } from './presentation-player';
import { StudioEditor } from './studio-editor';

export function DeckLoader({
  deckId,
  session,
  mode = 'edit',
}: {
  deckId: string;
  session: SessionIdentity;
  mode?: 'edit' | 'present';
}) {
  const [access, setAccess] = useState<DeckAccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/decks/${deckId}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? 'Presentation not found');
        setAccess(result);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Presentation not found'),
      );
  }, [deckId]);

  if (error) {
    return (
      <main className="deck-loading">
        <p>{error}</p>
        <a href="/">Back to presentations</a>
      </main>
    );
  }
  if (!access) {
    return (
      <main className="deck-loading" aria-busy="true">
        <p>Opening presentation…</p>
      </main>
    );
  }
  return mode === 'present' ? (
    <PresentationPlayer deck={access.deck} slides={access.slides} />
  ) : (
    <StudioEditor session={session} initialAccess={access} />
  );
}
