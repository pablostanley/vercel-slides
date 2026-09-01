'use client';

import { SlideRenderer } from '@open-slide/document';
import { Archive, Copy, MoreHorizontal, Plus, Search, Share2, Triangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { DeckSummary } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';
import { ShareDialog } from './share-dialog';

type Props = { session: SessionIdentity; decks: DeckSummary[] };

export function Dashboard({ session, decks }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [title, setTitle] = useState('Untitled presentation');
  const [source, setSource] = useState<'blank' | 'vercel-starter'>('blank');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sharingDeck, setSharingDeck] = useState<DeckSummary | null>(null);
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

  useEffect(() => setHydrated(true), []);

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
    router.push(`/decks/${result.deck.id}`);
  }

  async function mutateDeck(
    deck: DeckSummary,
    method: 'PATCH' | 'DELETE' | 'POST',
    body?: Record<string, unknown>,
    suffix = '',
  ) {
    const response = await fetch(`/api/decks/${deck.id}${suffix}`, {
      method,
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      setError(result?.error?.message ?? 'Could not update the presentation');
      return;
    }
    setOpenMenu(null);
    if (method === 'POST' && result?.deck) router.push(`/decks/${result.deck.id}`);
    else router.refresh();
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
                disabled={!hydrated || creating || title.trim().length === 0}
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
          openMenu={openMenu}
          onOpenMenu={setOpenMenu}
          onShare={setSharingDeck}
          onMutate={mutateDeck}
        />
        <DeckSection
          title="Shared with me"
          decks={shared}
          empty="Presentations shared with you will appear here."
          openMenu={openMenu}
          onOpenMenu={setOpenMenu}
          onShare={setSharingDeck}
          onMutate={mutateDeck}
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
      {sharingDeck && (
        <ShareDialog
          deckId={sharingDeck.id}
          deckRole={sharingDeck.role}
          session={session}
          onClose={() => setSharingDeck(null)}
        />
      )}
    </main>
  );
}

function DeckSection({
  title,
  decks,
  empty,
  openMenu,
  onOpenMenu,
  onShare,
  onMutate,
}: {
  title: string;
  decks: DeckSummary[];
  empty: string;
  openMenu: string | null;
  onOpenMenu: (deckId: string | null) => void;
  onShare: (deck: DeckSummary) => void;
  onMutate: (
    deck: DeckSummary,
    method: 'PATCH' | 'DELETE' | 'POST',
    body?: Record<string, unknown>,
    suffix?: string,
  ) => void;
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
              <a href={`/decks/${deck.id}`} className="deck-thumbnail">
                {deck.firstSlide ? (
                  <SlideRenderer document={deck.firstSlide.document} />
                ) : (
                  <div className="thumbnail-empty">
                    <Triangle fill="currentColor" strokeWidth={0} />
                    <span>Add your first slide</span>
                  </div>
                )}
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
                  aria-expanded={openMenu === deck.id}
                  onClick={() => onOpenMenu(openMenu === deck.id ? null : deck.id)}
                >
                  <MoreHorizontal size={16} />
                </button>
                {openMenu === deck.id && (
                  <div className="deck-action-menu" role="menu">
                    <a href={`/decks/${deck.id}`} role="menuitem">
                      Open
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => onMutate(deck, 'POST', undefined, '/duplicate')}
                    >
                      Duplicate
                    </button>
                    {deck.role !== 'viewer' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          const title = window.prompt('Presentation name', deck.title)?.trim();
                          if (title && title !== deck.title) {
                            onMutate(deck, 'PATCH', {
                              expectedRevision: deck.revision,
                              title,
                            });
                          }
                        }}
                      >
                        Rename
                      </button>
                    )}
                    <button type="button" role="menuitem" onClick={() => onShare(deck)}>
                      Share
                    </button>
                    {deck.role === 'owner' && (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() =>
                            onMutate(deck, 'PATCH', {
                              expectedRevision: deck.revision,
                              status: 'archived',
                            })
                          }
                        >
                          Archive
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="danger-action"
                          onClick={() => {
                            if (window.confirm(`Delete “${deck.title}”?`)) {
                              onMutate(deck, 'DELETE');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
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
