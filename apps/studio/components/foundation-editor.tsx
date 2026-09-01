'use client';

import { ChevronLeft, Play, Plus, Share2, Triangle } from 'lucide-react';
import { useState } from 'react';
import type { DeckAccess } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';

export function FoundationEditor({
  session,
  access,
}: {
  session: SessionIdentity;
  access: DeckAccess;
}) {
  const [title, setTitle] = useState(access.deck.title);
  const [revision, setRevision] = useState(access.deck.revision);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'conflict'>('saved');

  async function saveTitle() {
    if (title.trim() === access.deck.title) return;
    setSaveState('saving');
    const response = await fetch(`/api/decks/${encodeURIComponent(access.deck.id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify({ expectedRevision: revision, title }),
    });
    if (response.status === 409) {
      setSaveState('conflict');
      return;
    }
    const result = await response.json();
    if (!response.ok) {
      setSaveState('conflict');
      return;
    }
    setRevision(result.deck.revision);
    setSaveState('saved');
  }

  return (
    <main className="editor-shell">
      <header className="editor-toolbar">
        <a href="/" className="icon-button" aria-label="Back to presentations">
          <ChevronLeft size={17} />
        </a>
        <span className="brand-mark compact" aria-hidden>
          <Triangle fill="currentColor" strokeWidth={0} />
        </span>
        <input
          className="title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
          aria-label="Presentation title"
          readOnly={access.role === 'viewer'}
        />
        <span className={`save-state save-${saveState}`}>
          {saveState === 'saving' ? 'Saving…' : saveState === 'conflict' ? 'Conflict' : 'Saved'}
        </span>
        <div className="toolbar-spacer" />
        <button type="button" className="button button-secondary">
          <Share2 size={14} /> Share
        </button>
        <button type="button" className="button button-primary">
          <Play size={14} /> Present
        </button>
      </header>
      <aside className="slide-rail" aria-label="Slides">
        <button type="button" className="add-slide-rail">
          <Plus size={16} /> Add slide
        </button>
      </aside>
      <section className="editor-canvas workspace-grid">
        <div className="empty-deck">
          <div className="empty-slide-preview">
            <Triangle fill="currentColor" strokeWidth={0} />
          </div>
          <h1>Add your first slide</h1>
          <p>Choose from the published Vercel master library or begin with a blank canvas.</p>
          <button type="button" className="button button-primary button-large">
            <Plus size={16} /> Browse slide templates
          </button>
        </div>
      </section>
      <aside className="inspector-panel" aria-label="Inspector">
        <p className="eyebrow">Presentation</p>
        <dl>
          <div>
            <dt>Access</dt>
            <dd>{access.role}</dd>
          </div>
          <div>
            <dt>Slides</dt>
            <dd>{access.slides.length}</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>{revision}</dd>
          </div>
        </dl>
      </aside>
    </main>
  );
}
