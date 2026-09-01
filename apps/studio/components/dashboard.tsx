'use client';

import { Archive, Copy, MoreHorizontal, Plus, Search, Share2, Triangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { DeckSummary } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';

type Props = { session: SessionIdentity; decks: DeckSummary[] };

export function Dashboard({ session, decks }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('Untitled presentation');
  const [source, setSource] = useState<'blank' | 'vercel-starter'>('blank');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const visibleDecks = useMemo(
    () =>
      decks.filter(
        (deck) =>
          deck.status === 'active' && deck.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [decks, search],
  );
  const mine = visibleDecks.filter((deck) => deck.role === 'owner');
  const shared = visibleDecks.filter((deck) => deck.role !== 'owner');

  async function createDeck() {
    setCreating(true);
    setError(null);
    const response = await fetch('/api/decks', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify({ title, source }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? 'Could not create the presentation');
      setCreating(false);
      return;
    }
    router.push(`/decks/${encodeURIComponent(result.deck.id)}`);
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden>
            <Triangle fill="currentColor" strokeWidth={0} />
          </span>
          <span>Slides</span>
        </div>
        <label className="search-field">
          <Search aria-hidden size={15} />
          <span className="sr-only">Search presentations</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="account-chip" title={session.email}>
          <span>{session.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{session.name}</strong>
            <small>{session.role}</small>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="new-presentation" aria-labelledby="new-title">
          <div>
            <p className="eyebrow">New presentation</p>
            <h1 id="new-title">What are you making?</h1>
          </div>
          <div className="new-presentation-grid">
            <button
              type="button"
              className={`creation-card ${source === 'blank' ? 'is-selected' : ''}`}
              onClick={() => setSource('blank')}
            >
              <span className="creation-preview blank-preview">
                <Plus size={22} />
              </span>
              <strong>Blank presentation</strong>
              <small>Start empty, with the full Vercel master library connected.</small>
            </button>
            <button
              type="button"
              className={`creation-card ${source === 'vercel-starter' ? 'is-selected' : ''}`}
              onClick={() => setSource('vercel-starter')}
            >
              <span className="creation-preview starter-preview">
                <Triangle fill="currentColor" strokeWidth={0} />
                <b>What will you ship next?</b>
                <i>Vercel starter · 7 slides</i>
              </span>
              <strong>Vercel Starter</strong>
              <small>Cover, agenda, section, content, data, decision, and closing.</small>
            </button>
            <div className="creation-form">
              <label>
                <span>Presentation name</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={200}
                />
              </label>
              <button
                type="button"
                className="button button-primary"
                disabled={creating || title.trim().length === 0}
                onClick={createDeck}
              >
                {creating ? 'Creating…' : 'Create presentation'}
              </button>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        <DeckSection
          title="My presentations"
          decks={mine}
          empty="Your presentations will appear here."
        />
        <DeckSection
          title="Shared with me"
          decks={shared}
          empty="Presentations shared with you will appear here."
        />

        <section className="library-row" aria-labelledby="libraries-title">
          <div>
            <p className="eyebrow">Template libraries</p>
            <h2 id="libraries-title">Vercel</h2>
            <p>62 published masters · Covers, data, product, partnerships, and more.</p>
          </div>
          {session.role === 'admin' && <a href="/admin/templates/vercel">Manage masters</a>}
        </section>
      </div>
    </main>
  );
}

function DeckSection({
  title,
  decks,
  empty,
}: {
  title: string;
  decks: DeckSummary[];
  empty: string;
}) {
  return (
    <section className="deck-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{decks.length}</span>
      </div>
      {decks.length === 0 ? (
        <p className="empty-copy">{empty}</p>
      ) : (
        <div className="deck-grid">
          {decks.map((deck) => (
            <article className="deck-card" key={deck.id}>
              <a href={`/decks/${encodeURIComponent(deck.id)}`} className="deck-thumbnail">
                <div className="thumbnail-empty">
                  <Triangle fill="currentColor" strokeWidth={0} />
                  <span>
                    {deck.slideCount === 0 ? 'Add your first slide' : `${deck.slideCount} slides`}
                  </span>
                </div>
              </a>
              <div className="deck-meta">
                <div>
                  <strong>{deck.title}</strong>
                  <span>
                    {deck.role} · {new Date(deck.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`More actions for ${deck.title}`}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="sr-only">
                <Share2 /> <Copy /> <Archive />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
