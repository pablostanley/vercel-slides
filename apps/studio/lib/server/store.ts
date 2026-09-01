import type { SlideDocument } from '@open-slide/document';
import type { Deck, DeckAccess, DeckMember, DeckRole, DeckSummary, StudioUser } from '@/lib/models';

export type IdentityInput = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: StudioUser['role'];
};

export type CreateDeckInput = {
  id: string;
  ownerId: string;
  title: string;
  templateLibraryId: string | null;
  slides: Array<{
    id: string;
    document: SlideDocument;
    notes: string;
    masterSlideId: string | null;
    masterVersionId: string | null;
  }>;
};

export type UpdateDeckInput = {
  actorId: string;
  deckId: string;
  expectedRevision: number;
  title?: string;
  visibility?: Deck['visibility'];
  status?: Deck['status'];
};

export type ShareDeckInput = {
  actorId: string;
  deckId: string;
  email: string;
  role: Exclude<DeckRole, 'owner'>;
};

export type StudioStore = {
  ensureUser(identity: IdentityInput): Promise<StudioUser>;
  listDecks(userId: string): Promise<DeckSummary[]>;
  createDeck(input: CreateDeckInput): Promise<Deck>;
  getDeckAccess(userId: string, deckId: string): Promise<DeckAccess | null>;
  updateDeck(input: UpdateDeckInput): Promise<Deck>;
  deleteDeck(actorId: string, deckId: string): Promise<void>;
  listMembers(actorId: string, deckId: string): Promise<DeckMember[]>;
  shareDeck(input: ShareDeckInput): Promise<DeckMember>;
  unshareDeck(actorId: string, deckId: string, email: string): Promise<void>;
};

export class StoreError extends Error {
  constructor(
    public readonly code: 'not_found' | 'forbidden' | 'conflict' | 'invalid',
    message: string,
    public readonly currentRevision?: number,
  ) {
    super(message);
  }
}

export function canEdit(role: DeckRole) {
  return role === 'owner' || role === 'editor';
}

export function isOwner(role: DeckRole) {
  return role === 'owner';
}
