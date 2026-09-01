import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPreviewMasterCatalog, slideDocumentSchema } from '@open-slide/document';
import type {
  Deck,
  DeckAccess,
  DeckMember,
  DeckRole,
  DeckSlide,
  DeckSummary,
  PublishedMaster,
  StudioAsset,
  StudioUser,
} from '@/lib/models';
import {
  type CreateDeckInput,
  type IdentityInput,
  isOwner,
  type MutateDeckSlidesInput,
  type RecordAssetInput,
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
  assets: Map<string, StudioAsset>;
};

const globalStore = globalThis as typeof globalThis & { __vercelSlidesMemoryState?: MemoryState };

function statePath() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.STUDIO_STORAGE === 'neon' ||
    (process.env.NODE_ENV === 'test' && process.env.STUDIO_TEST_AUTH !== '1')
  ) {
    return null;
  }
  const namespace =
    process.env.STUDIO_MEMORY_NAMESPACE ??
    createHash('sha256').update(process.cwd()).digest('hex').slice(0, 16);
  return join(tmpdir(), `vercel-slides-studio-${namespace}.json`);
}

function deserializeState(value: string): MemoryState {
  const parsed = JSON.parse(value) as Record<keyof MemoryState, unknown[][]>;
  return {
    users: new Map(parsed.users as Array<[string, StudioUser]>),
    decks: new Map(parsed.decks as Array<[string, Deck]>),
    memberships: new Map(parsed.memberships as Array<[string, Membership]>),
    invites: new Map(parsed.invites as Array<[string, Invite]>),
    slides: new Map(parsed.slides as Array<[string, DeckSlide]>),
    assets: new Map(parsed.assets as Array<[string, StudioAsset]>),
  };
}

function readPersistedState() {
  const path = statePath();
  if (!path || !existsSync(path)) return null;
  return deserializeState(readFileSync(path, 'utf8'));
}

function persistState(state: MemoryState) {
  const path = statePath();
  if (!path) return;
  writeFileSync(
    path,
    JSON.stringify({
      users: [...state.users],
      decks: [...state.decks],
      memberships: [...state.memberships],
      invites: [...state.invites],
      slides: [...state.slides],
      assets: [...state.assets],
    }),
  );
}

function getState(): MemoryState {
  globalStore.__vercelSlidesMemoryState ??= {
    users: new Map(),
    decks: new Map(),
    memberships: new Map(),
    invites: new Map(),
    slides: new Map(),
    assets: new Map(),
  };
  globalStore.__vercelSlidesMemoryState.slides ??= new Map();
  globalStore.__vercelSlidesMemoryState.assets ??= new Map();
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
  private state = readPersistedState() ?? getState();

  private refresh() {
    this.state = readPersistedState() ?? this.state;
    globalStore.__vercelSlidesMemoryState = this.state;
  }

  private persist() {
    persistState(this.state);
  }

  async ensureUser(identity: IdentityInput): Promise<StudioUser> {
    this.refresh();
    const previous = this.state.users.get(identity.id);
    const now = isoNow();
    const user: StudioUser = {
      id: identity.id,
      email: identity.email,
      name: identity.name,
      username: identity.username,
      avatarUrl: identity.avatarUrl,
      role: identity.role,
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
    this.persist();
    return structuredClone(user);
  }

  async listDecks(userId: string): Promise<DeckSummary[]> {
    this.refresh();
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
    this.refresh();
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
    this.persist();
    return structuredClone(deck);
  }

  async getDeckAccess(userId: string, deckId: string): Promise<DeckAccess | null> {
    this.refresh();
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
    this.refresh();
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
    this.persist();
    return structuredClone(updated);
  }

  async deleteDeck(actorId: string, deckId: string): Promise<void> {
    this.refresh();
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
    this.persist();
  }

  async listMembers(actorId: string, deckId: string): Promise<DeckMember[]> {
    this.refresh();
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
    this.refresh();
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
      const member: DeckMember = {
        deckId: input.deckId,
        userId: user.id,
        email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: input.role,
        pending: false,
        createdAt,
      };
      this.persist();
      return member;
    }
    this.state.invites.set(inviteKey(input.deckId, email), {
      deckId: input.deckId,
      email,
      role: input.role,
      invitedBy: input.actorId,
      createdAt,
    });
    const member: DeckMember = {
      deckId: input.deckId,
      userId: null,
      email,
      name: null,
      avatarUrl: null,
      role: input.role,
      pending: true,
      createdAt,
    };
    this.persist();
    return member;
  }

  async unshareDeck(actorId: string, deckId: string, email: string): Promise<void> {
    this.refresh();
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
    this.persist();
  }

  async mutateDeckSlides(input: MutateDeckSlidesInput): Promise<DeckAccess> {
    this.refresh();
    const { deck, role } = requireDeck(this.state, input.actorId, input.deckId);
    if (role === 'viewer') throw new StoreError('forbidden', 'Viewer access is read-only');
    if (deck.revision !== input.expectedRevision) {
      throw new StoreError(
        'conflict',
        'The presentation changed in another session',
        deck.revision,
      );
    }
    const slides = [...this.state.slides.values()]
      .filter((slide) => slide.deckId === deck.id)
      .sort((left, right) => left.position - right.position);
    const mutation = input.mutation;
    if (mutation.operation === 'update') {
      const slide = this.state.slides.get(mutation.slideId);
      if (!slide || slide.deckId !== deck.id) throw new StoreError('not_found', 'Slide not found');
      this.state.slides.set(slide.id, {
        ...slide,
        document: mutation.document
          ? slideDocumentSchema.parse(structuredClone(mutation.document))
          : slide.document,
        schemaVersion: mutation.document?.schemaVersion ?? slide.schemaVersion,
        notes: mutation.notes ?? slide.notes,
        revision: slide.revision + 1,
        updatedAt: isoNow(),
      });
    } else if (mutation.operation === 'insert') {
      if (this.state.slides.has(mutation.slideId)) {
        throw new StoreError('conflict', 'Slide already exists', deck.revision);
      }
      const afterIndex = mutation.afterSlideId
        ? slides.findIndex((slide) => slide.id === mutation.afterSlideId)
        : -1;
      if (mutation.afterSlideId && afterIndex < 0)
        throw new StoreError('not_found', 'Slide not found');
      const insertAt = afterIndex + 1;
      slides.splice(insertAt, 0, {
        id: mutation.slideId,
        deckId: deck.id,
        position: insertAt,
        masterSlideId: mutation.masterSlideId,
        masterVersionId: mutation.masterVersionId,
        schemaVersion: mutation.document.schemaVersion,
        document: slideDocumentSchema.parse(structuredClone(mutation.document)),
        notes: '',
        revision: 0,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      });
    } else if (mutation.operation === 'duplicate') {
      const sourceIndex = slides.findIndex((slide) => slide.id === mutation.slideId);
      if (sourceIndex < 0) throw new StoreError('not_found', 'Slide not found');
      const source = slides[sourceIndex];
      slides.splice(sourceIndex + 1, 0, {
        ...structuredClone(source),
        id: mutation.newSlideId,
        document: slideDocumentSchema.parse(structuredClone(mutation.document)),
        revision: 0,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      });
    } else if (mutation.operation === 'delete') {
      const sourceIndex = slides.findIndex((slide) => slide.id === mutation.slideId);
      if (sourceIndex < 0) throw new StoreError('not_found', 'Slide not found');
      this.state.slides.delete(mutation.slideId);
      slides.splice(sourceIndex, 1);
    } else if (mutation.operation === 'reorder') {
      if (
        mutation.slideIds.length !== slides.length ||
        new Set(mutation.slideIds).size !== slides.length ||
        mutation.slideIds.some((slideId) => !slides.some((slide) => slide.id === slideId))
      ) {
        throw new StoreError('invalid', 'Slide order must include every slide exactly once');
      }
      slides.sort(
        (left, right) => mutation.slideIds.indexOf(left.id) - mutation.slideIds.indexOf(right.id),
      );
    } else {
      for (const [slideId, slide] of this.state.slides) {
        if (slide.deckId === deck.id) this.state.slides.delete(slideId);
      }
      slides.splice(
        0,
        slides.length,
        ...mutation.slides.map((slide, position) => ({
          id: slide.id,
          deckId: deck.id,
          position,
          masterSlideId: slide.masterSlideId,
          masterVersionId: slide.masterVersionId,
          schemaVersion: slide.document.schemaVersion,
          document: slideDocumentSchema.parse(structuredClone(slide.document)),
          notes: slide.notes,
          revision: 0,
          createdAt: isoNow(),
          updatedAt: isoNow(),
        })),
      );
    }
    slides.forEach((slide, position) => {
      const current = this.state.slides.get(slide.id) ?? slide;
      this.state.slides.set(slide.id, { ...current, position });
    });
    const updatedDeck = { ...deck, revision: deck.revision + 1, updatedAt: isoNow() };
    this.state.decks.set(deck.id, updatedDeck);
    this.persist();
    return {
      deck: structuredClone(updatedDeck),
      role,
      slides: slides.map((slide) => structuredClone(this.state.slides.get(slide.id) ?? slide)),
    };
  }

  async listPublishedMasters(_userId: string, librarySlug: string): Promise<PublishedMaster[]> {
    if (librarySlug !== 'vercel') return [];
    const createdAt = '2026-01-01T00:00:00.000Z';
    return createPreviewMasterCatalog().map((master) => ({
      id: master.id,
      libraryId: master.libraryId,
      slug: master.slug,
      title: master.title,
      description: master.description,
      category: master.category,
      tags: master.tags,
      position: master.position,
      currentPublishedVersionId: master.versionId,
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      version: {
        id: master.versionId,
        masterSlideId: master.id,
        version: master.version,
        schemaVersion: master.document.schemaVersion,
        document: master.document,
        thumbnail: null,
        createdBy: 'seed:vercel',
        status: 'published',
        createdAt,
        publishedAt: createdAt,
      },
    }));
  }

  async getPublishedMaster(userId: string, versionId: string): Promise<PublishedMaster | null> {
    const masters = await this.listPublishedMasters(userId, 'vercel');
    return masters.find((master) => master.version.id === versionId) ?? null;
  }

  async recordAsset(input: RecordAssetInput): Promise<StudioAsset> {
    this.refresh();
    const { role } = requireDeck(this.state, input.ownerId, input.deckId);
    if (role === 'viewer') throw new StoreError('forbidden', 'Viewer access is read-only');
    const asset: StudioAsset = { ...input, createdAt: isoNow() };
    this.state.assets.set(asset.id, asset);
    this.persist();
    return structuredClone(asset);
  }
}

export function resetMemoryStore() {
  globalStore.__vercelSlidesMemoryState = undefined;
  const path = statePath();
  if (path && existsSync(path)) unlinkSync(path);
}

import { createHash } from 'node:crypto';
