'use client';

import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DeckMember, DeckRole } from '@/lib/models';
import type { SessionIdentity } from '@/lib/server/auth';

export function ShareDialog({
  deckId,
  deckRole,
  session,
  onClose,
}: {
  deckId: string;
  deckRole: DeckRole;
  session: SessionIdentity;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<DeckMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [state, setState] = useState<'loading' | 'ready' | 'saving'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/decks/${deckId}/share`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? 'Could not load sharing');
        setMembers(result.members);
        setState('ready');
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : 'Could not load sharing');
        setState('ready');
      });
  }, [deckId]);

  async function share() {
    setState('saving');
    setError(null);
    const response = await fetch(`/api/decks/${deckId}/share`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify({ email, role }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error?.message ?? 'Could not share presentation');
      setState('ready');
      return;
    }
    setMembers((current) => [
      ...current.filter((member) => member.email.toLowerCase() !== email.toLowerCase()),
      result.member,
    ]);
    setEmail('');
    setState('ready');
  }

  async function remove(member: DeckMember) {
    const response = await fetch(`/api/decks/${deckId}/share`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json', 'x-csrf-token': session.csrfToken },
      body: JSON.stringify({ email: member.email }),
    });
    if (response.ok) {
      setMembers((current) => current.filter((candidate) => candidate.email !== member.email));
    }
  }

  return (
    <dialog open className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dialog-header">
          <div>
            <p className="eyebrow">Access</p>
            <h2 id="share-title">Share presentation</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </header>
        {deckRole === 'owner' && (
          <div className="share-form">
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@vercel.com"
              />
            </label>
            <label>
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </label>
            <button
              type="button"
              className="button button-primary"
              onClick={share}
              disabled={!email || state === 'saving'}
            >
              {state === 'saving' ? 'Sharing…' : 'Share'}
            </button>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="member-list">
          {state === 'loading' && <p>Loading access…</p>}
          {state !== 'loading' && members.length === 0 && <p>No collaborators yet.</p>}
          {members.map((member) => (
            <div key={member.email}>
              <span>{member.name?.slice(0, 1) ?? member.email.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{member.name ?? member.email}</strong>
                <small>
                  {member.role}
                  {member.pending ? ' · pending sign-in' : ''}
                </small>
              </div>
              {deckRole === 'owner' && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${member.email}`}
                  onClick={() => remove(member)}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </dialog>
  );
}
