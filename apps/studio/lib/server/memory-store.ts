import type {
  Deck,
  DeckAccess,
  DeckMember,
  DeckRole,
  DeckSlide,
  DeckSummary,
  StudioUser,
} from '@/lib/models';
import {
  type CreateDeckInput,
  type IdentityInput,
  isOwner,
  type ShareDeckInput,
  StoreError,
  type StudioStore,
  type UpdateDeckInput,
} from './store';

type Membership = {
  deckId: string;
  userId: string;
  role: Exclude<DeckRole, 'owner'>;
  createdAt: string;
};
type Invite = {
  deckId: string;
  email: string;
  role: Exclude<DeckRole, 'owner'>;
  invitedBy: string;
  createdAt: string;
};

type MemoryState = {
  users: Map<string, StudioUser>;
  decks: Map<string, Deck>;
  memberships: Map<string, Membership>;
  invites: Map<string, Invite>;
  slides: Map<string, DeckSlide>;
};

const globalStore = globalThis as typeof globalThis & { __vercelSlidesMemoryState?: MemoryState };

function getState(): MemoryState {
  globalStore.__vercelSlidesMemoryState ??= {
    users: new Map(),
    decks: new Map(),
    memberships: new Map(),
    invites: new Map(),
    slides: new Map(),
  };
  globalStore.__vercelSlidesMemoryState.slides ??= new Map();
  return globalStore.__vercelSlidesMemoryState;
}

function isoNow() {
  return new Date().toISOString();
}

function membershipKey(deckId: string, userId: string) {
  return `${deckId}:${userId}`;
}

function inviteKey(deckId: string, email: string) {
  return `${deckId}:${email.toLowerCase()}`;
}

function roleFor(state: MemoryState, userId: string, deck: Deck): DeckRole | null {
  if (deck.ownerId === userId) return 'owner';
  return state.memberships.get(membershipKey(deck.id, userId))?.role ?? null;
}

function requireDeck(state: MemoryState, userId: string, deckId: string) {
  const deck = state.decks.get(deckId);
  if (!deck) throw new StoreError('not_found', 'Presentation not found');
  const role = roleFor(state, userId, deck);
  if (!role) throw new StoreError('forbidden', 'You do not have access to this presentation');
  return { deck, role };
}

export class MemoryStudioStore implements StudioStore {
  private readonly state = getState();

  async ensureUser(identity: IdentityInput): Promise<StudioUser> {
    const previous = this.state.users.get(identity.id);
    const now = isoNow();
    const user: StudioUser = {
      ...identity,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.state.users.set(user.id, user);
    for (const invite of this.state.invites.values()) {
      if (invite.email.toLowerCase() !== user.email.toLowerCase()) continue;
      this.state.memberships.set(membershipKey(invite.deckId, user.id), {
        deckId: invite.deckId,
        userId: user.id,
        role: invite.role,
        createdAt: invite.createdAt,
      });
      this.state.invites.delete(inviteKey(invite.deckId, invite.email));
    }
    return structuredClone(user);
  }

  async listDecks(userId: string): Promise<DeckSummary[]> {
    return [...this.state.decks.values()]
      .map((deck) => ({ deck, role: roleFor(this.state, userId, deck) }))
      .filter((entry): entry is { deck: Deck; role: DeckRole } => entry.role !== null)
      .map(({ deck, role }) => {
        const slides = [...this.state.slides.values()]
          .filter((slide) => slide.deckId === deck.id)
          .sort((left, right) => left.position - right.position);
        return {
          ...structuredClone(deck),
          role,
          firstSlide: slides[0] ? structuredClone(slides[0]) : null,
          slideCount: slides.length,
        };
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async createDeck(input: CreateDeckInput): Promise<Deck> {
    if (!this.state.users.has(input.ownerId)) {
      throw new StoreError('invalid', 'Presentation owner does not exist');
    }
    if (this.state.decks.has(input.id))
      throw new StoreError('conflict', 'Presentation already exists');
    const now = isoNow();
    const deck: Deck = {
      id: input.id,
      ownerId: input.ownerId,
      title: input.title,
      templateLibraryId: input.templateLibraryId,
      theme: {},
      visibility: 'private',
      status: 'active',
      revision: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.state.decks.set(deck.id, deck);
    input.slides.forEach((slide, position) => {
      this.state.slides.set(slide.id, {
        id: slide.id,
        deckId: deck.id,
        position,
        masterSlideId: slide.masterSlideId,
        masterVersionId: slide.masterVersionId,
        schemaVersion: slide.document.schemaVersion,
        document: structuredClone(slide.document),
        notes: slide.notes,
        revision: 0,
        createdAt: now,
        updatedAt: now,
      });
    });
    return structuredClone(deck);
  }

  async getDeckAccess(userId: string, deckId: string): Promise<DeckAccess | null> {
    const deck = this.state.decks.get(deckId);
    if (!deck) return null;
    const role = roleFor(this.state, userId, deck);
    if (!role) return null;
    const slides = [...this.state.slides.values()]
      .filter((slide) => slide.deckId === deck.id)
      .sort((left, right) => left.position - right.position)
      .map((slide) => structuredClone(slide));
    return { deck: structuredClone(deck), role, slides };
  }

  async updateDeck(input: UpdateDeckInput): Promise<Deck> {
    const { deck, role } = requireDeck(this.state, input.actorId, input.deckId);
    if (input.status !== undefined && !isOwner(role)) {
      throw new StoreError('forbidden', 'Only the owner can archive a presentation');
    }
    if (role === 'viewer') throw new StoreError('forbidden', 'Viewer access is read-only');
    if (deck.revision !== input.expectedRevision) {
      throw new StoreError(
        'conflict',
        'The presentation changed in another session',
        deck.revision,
      );
    }
    const updated: Deck = {
      ...deck,
      title: input.title ?? deck.title,
      visibility: input.visibility ?? deck.visibility,
      status: input.status ?? deck.status,
      revision: deck.revision + 1,
      updatedAt: isoNow(),
    };
    this.state.decks.set(deck.id, updated);
    return structuredClone(updated);
  }

  async deleteDeck(actorId: string, deckId: string): Promise<void> {
    const { role } = requireDeck(this.state, actorId, deckId);
    if (!isOwner(role))
      throw new StoreError('forbidden', 'Only the owner can delete a presentation');
    this.state.decks.delete(deckId);
    for (const [key, slide] of this.state.slides) {
      if (slide.deckId === deckId) this.state.slides.delete(key);
    }
    for (const [key, member] of this.state.memberships) {
      if (member.deckId === deckId) this.state.memberships.delete(key);
    }
    for (const [key, invite] of this.state.invites) {
      if (invite.deckId === deckId) this.state.invites.delete(key);
    }
  }

  async listMembers(actorId: string, deckId: string): Promise<DeckMember[]> {
    requireDeck(this.state, actorId, deckId);
    const members: DeckMember[] = [];
    for (const member of this.state.memberships.values()) {
      if (member.deckId !== deckId) continue;
      const user = this.state.users.get(member.userId);
      if (!user) continue;
      members.push({
        deckId,
        userId: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: member.role,
        pending: false,
        createdAt: member.createdAt,
      });
    }
    for (const invite of this.state.invites.values()) {
      if (invite.deckId !== deckId) continue;
      members.push({
        deckId,
        userId: null,
        email: invite.email,
        name: null,
        avatarUrl: null,
        role: invite.role,
        pending: true,
        createdAt: invite.createdAt,
      });
    }
    return members.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async shareDeck(input: ShareDeckInput): Promise<DeckMember> {
    const { role } = requireDeck(this.state, input.actorId, input.deckId);
    if (!isOwner(role)) throw new StoreError('forbidden', 'Only the owner can manage sharing');
    const email = input.email.trim().toLowerCase();
    const user = [...this.state.users.values()].find(
      (candidate) => candidate.email.toLowerCase() === email,
    );
    const createdAt = isoNow();
    if (user) {
      this.state.memberships.set(membershipKey(input.deckId, user.id), {
        deckId: input.deckId,
        userId: user.id,
        role: input.role,
        createdAt,
      });
      this.state.invites.delete(inviteKey(input.deckId, email));
      return {
        deckId: input.deckId,
        userId: user.id,
        email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: input.role,
        pending: false,
        createdAt,
      };
    }
    this.state.invites.set(inviteKey(input.deckId, email), {
      deckId: input.deckId,
      email,
      role: input.role,
      invitedBy: input.actorId,
      createdAt,
    });
    return {
      deckId: input.deckId,
      userId: null,
      email,
      name: null,
      avatarUrl: null,
      role: input.role,
      pending: true,
      createdAt,
    };
  }

  async unshareDeck(actorId: string, deckId: string, email: string): Promise<void> {
    const { role } = requireDeck(this.state, actorId, deckId);
    if (!isOwner(role)) throw new StoreError('forbidden', 'Only the owner can manage sharing');
    const normalizedEmail = email.toLowerCase();
    for (const [key, member] of this.state.memberships) {
      const user = this.state.users.get(member.userId);
      if (member.deckId === deckId && user?.email.toLowerCase() === normalizedEmail) {
        this.state.memberships.delete(key);
      }
    }
    this.state.invites.delete(inviteKey(deckId, normalizedEmail));
  }
}

export function resetMemoryStore() {
  globalStore.__vercelSlidesMemoryState = undefined;
}
