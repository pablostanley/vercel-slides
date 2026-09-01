import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createVercelMasterCatalog, slideDocumentSchema } from '@open-slide/document';
import type {
  AdminMaster,
  Deck,
  DeckAccess,
  DeckMember,
  DeckRole,
  DeckSlide,
  DeckSummary,
  MasterSlide,
  MasterSlideVersion,
  PublishedMaster,
  StudioAsset,
  StudioUser,
} from '@/lib/models';
import {
  type CreateDeckInput,
  type CreateMasterDraftInput,
  type CreateMasterInput,
  type IdentityInput,
  isOwner,
  type MutateDeckSlidesInput,
  type PublishMasterInput,
  type RecordAssetInput,
  type ShareDeckInput,
  StoreError,
  type StudioStore,
  type UpdateDeckInput,
  type UpdateMasterDraftInput,
  type UpdateMasterInput,
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
  masters: Map<string, MasterSlide>;
  masterVersions: Map<string, MasterSlideVersion>;
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
  const parsed = JSON.parse(value) as Partial<Record<keyof MemoryState, unknown[][]>>;
  return seedMasterState({
    users: new Map(parsed.users as Array<[string, StudioUser]>),
    decks: new Map(parsed.decks as Array<[string, Deck]>),
    memberships: new Map(parsed.memberships as Array<[string, Membership]>),
    invites: new Map(parsed.invites as Array<[string, Invite]>),
    slides: new Map(parsed.slides as Array<[string, DeckSlide]>),
    assets: new Map(parsed.assets as Array<[string, StudioAsset]>),
    masters: new Map(parsed.masters as Array<[string, MasterSlide]>),
    masterVersions: new Map(parsed.masterVersions as Array<[string, MasterSlideVersion]>),
  });
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
      masters: [...state.masters],
      masterVersions: [...state.masterVersions],
    }),
  );
}

function seedMasterState(state: MemoryState) {
  if (state.masters.size > 0) return state;
  const createdAt = '2026-09-01T00:00:00.000Z';
  for (const seeded of createVercelMasterCatalog()) {
    state.masters.set(seeded.id, {
      id: seeded.id,
      libraryId: seeded.libraryId,
      slug: seeded.slug,
      title: seeded.title,
      description: seeded.description,
      category: seeded.category,
      tags: seeded.tags,
      position: seeded.position,
      currentPublishedVersionId: seeded.versionId,
      status: 'active',
      createdAt,
      updatedAt: createdAt,
    });
    state.masterVersions.set(seeded.versionId, {
      id: seeded.versionId,
      masterSlideId: seeded.id,
      version: seeded.version,
      schemaVersion: seeded.document.schemaVersion,
      document: seeded.document,
      thumbnail: null,
      createdBy: 'seed:vercel',
      status: 'published',
      revision: 0,
      createdAt,
      publishedAt: createdAt,
    });
  }
  return state;
}

function getState(): MemoryState {
  globalStore.__vercelSlidesMemoryState ??= {
    users: new Map(),
    decks: new Map(),
    memberships: new Map(),
    invites: new Map(),
    slides: new Map(),
    assets: new Map(),
    masters: new Map(),
    masterVersions: new Map(),
  };
  globalStore.__vercelSlidesMemoryState.slides ??= new Map();
  globalStore.__vercelSlidesMemoryState.assets ??= new Map();
  globalStore.__vercelSlidesMemoryState.masters ??= new Map();
  globalStore.__vercelSlidesMemoryState.masterVersions ??= new Map();
  return seedMasterState(globalStore.__vercelSlidesMemoryState);
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

function requireAdmin(state: MemoryState, actorId: string) {
  if (state.users.get(actorId)?.role !== 'admin') {
    throw new StoreError('forbidden', 'Administrator access is required');
  }
}

function adminMaster(state: MemoryState, master: MasterSlide): AdminMaster {
  return {
    ...structuredClone(master),
    versions: [...state.masterVersions.values()]
      .filter((version) => version.masterSlideId === master.id)
      .sort((left, right) => right.version - left.version)
      .map((version) => structuredClone(version)),
  };
}

export class MemoryStudioStore implements StudioStore {
  private state = readPersistedState() ?? getState();

  private refresh() {
    this.state = seedMasterState(readPersistedState() ?? this.state);
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
    this.refresh();
    return [...this.state.masters.values()]
      .filter(
        (master) =>
          master.libraryId === 'library:vercel' &&
          master.status === 'active' &&
          master.currentPublishedVersionId,
      )
      .sort((left, right) => left.position - right.position)
      .flatMap((master) => {
        const version = master.currentPublishedVersionId
          ? this.state.masterVersions.get(master.currentPublishedVersionId)
          : null;
        return version?.status === 'published'
          ? [{ ...structuredClone(master), version: structuredClone(version) }]
          : [];
      });
  }

  async getPublishedMaster(userId: string, versionId: string): Promise<PublishedMaster | null> {
    const masters = await this.listPublishedMasters(userId, 'vercel');
    return masters.find((master) => master.version.id === versionId) ?? null;
  }

  async listAdminMasters(actorId: string, librarySlug: string): Promise<AdminMaster[]> {
    this.refresh();
    requireAdmin(this.state, actorId);
    if (librarySlug !== 'vercel') return [];
    return [...this.state.masters.values()]
      .filter((master) => master.libraryId === 'library:vercel')
      .sort((left, right) => left.position - right.position)
      .map((master) => adminMaster(this.state, master));
  }

  async getAdminMaster(actorId: string, masterId: string): Promise<AdminMaster | null> {
    this.refresh();
    requireAdmin(this.state, actorId);
    const master = this.state.masters.get(masterId);
    return master ? adminMaster(this.state, master) : null;
  }

  async createMaster(input: CreateMasterInput): Promise<AdminMaster> {
    this.refresh();
    requireAdmin(this.state, input.actorId);
    if (input.librarySlug !== 'vercel') throw new StoreError('not_found', 'Library not found');
    if (
      this.state.masters.has(input.id) ||
      [...this.state.masters.values()].some((master) => master.slug === input.slug)
    ) {
      throw new StoreError('conflict', 'A master with this slug already exists');
    }
    const now = isoNow();
    const position =
      Math.max(-1, ...[...this.state.masters.values()].map((item) => item.position)) + 1;
    const master: MasterSlide = {
      id: input.id,
      libraryId: 'library:vercel',
      slug: input.slug,
      title: input.title,
      description: input.description,
      category: input.category,
      tags: [...input.tags],
      position,
      currentPublishedVersionId: null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const version: MasterSlideVersion = {
      id: input.versionId,
      masterSlideId: master.id,
      version: 1,
      schemaVersion: input.document.schemaVersion,
      document: slideDocumentSchema.parse(structuredClone(input.document)),
      thumbnail: null,
      createdBy: input.actorId,
      status: 'draft',
      revision: 0,
      createdAt: now,
      publishedAt: null,
    };
    this.state.masters.set(master.id, master);
    this.state.masterVersions.set(version.id, version);
    this.persist();
    return adminMaster(this.state, master);
  }

  async duplicateMaster(
    actorId: string,
    sourceMasterId: string,
    id: string,
    versionId: string,
    slug: string,
  ): Promise<AdminMaster> {
    const source = await this.getAdminMaster(actorId, sourceMasterId);
    if (!source) throw new StoreError('not_found', 'Master not found');
    const sourceVersion = source.versions[0];
    if (!sourceVersion) throw new StoreError('invalid', 'Master has no version to duplicate');
    return this.createMaster({
      actorId,
      librarySlug: 'vercel',
      id,
      versionId,
      slug,
      title: `${source.title} copy`,
      description: source.description,
      category: source.category,
      tags: source.tags,
      document: sourceVersion.document,
    });
  }

  async updateMaster(input: UpdateMasterInput): Promise<MasterSlide> {
    this.refresh();
    requireAdmin(this.state, input.actorId);
    const master = this.state.masters.get(input.masterId);
    if (!master) throw new StoreError('not_found', 'Master not found');
    const updated = {
      ...master,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.tags !== undefined ? { tags: [...input.tags] } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: isoNow(),
    };
    this.state.masters.set(master.id, updated);
    this.persist();
    return structuredClone(updated);
  }

  async reorderMasters(actorId: string, librarySlug: string, masterIds: string[]): Promise<void> {
    this.refresh();
    requireAdmin(this.state, actorId);
    const masters = [...this.state.masters.values()]
      .filter((master) => master.libraryId === `library:${librarySlug}`)
      .sort((left, right) => left.position - right.position);
    if (
      masters.length !== masterIds.length ||
      new Set(masterIds).size !== masters.length ||
      masterIds.some((masterId) => !masters.some((master) => master.id === masterId))
    ) {
      throw new StoreError('invalid', 'Master order must include every master exactly once');
    }
    masterIds.forEach((masterId, position) => {
      const master = this.state.masters.get(masterId);
      if (master) this.state.masters.set(masterId, { ...master, position, updatedAt: isoNow() });
    });
    this.persist();
  }

  async createMasterDraft(input: CreateMasterDraftInput): Promise<MasterSlideVersion> {
    this.refresh();
    requireAdmin(this.state, input.actorId);
    const master = this.state.masters.get(input.masterId);
    const source = this.state.masterVersions.get(input.sourceVersionId);
    if (!master || !source || source.masterSlideId !== master.id) {
      throw new StoreError('not_found', 'Master version not found');
    }
    if (
      [...this.state.masterVersions.values()].some(
        (version) => version.masterSlideId === master.id && version.status === 'draft',
      )
    ) {
      throw new StoreError('conflict', 'This master already has a draft');
    }
    const nextVersion =
      Math.max(
        0,
        ...[...this.state.masterVersions.values()]
          .filter((version) => version.masterSlideId === master.id)
          .map((version) => version.version),
      ) + 1;
    const draft: MasterSlideVersion = {
      ...structuredClone(source),
      id: input.versionId,
      version: nextVersion,
      document: structuredClone(source.document),
      createdBy: input.actorId,
      status: 'draft',
      revision: 0,
      createdAt: isoNow(),
      publishedAt: null,
    };
    this.state.masterVersions.set(draft.id, draft);
    this.persist();
    return structuredClone(draft);
  }

  async updateMasterDraft(input: UpdateMasterDraftInput): Promise<MasterSlideVersion> {
    this.refresh();
    requireAdmin(this.state, input.actorId);
    const version = this.state.masterVersions.get(input.versionId);
    if (!version || version.masterSlideId !== input.masterId) {
      throw new StoreError('not_found', 'Master version not found');
    }
    if (version.status !== 'draft') {
      throw new StoreError('invalid', 'Published master versions are immutable');
    }
    if (version.revision !== input.expectedRevision) {
      throw new StoreError(
        'conflict',
        'The master draft changed in another session',
        version.revision,
      );
    }
    const updated: MasterSlideVersion = {
      ...version,
      schemaVersion: input.document.schemaVersion,
      document: slideDocumentSchema.parse(structuredClone(input.document)),
      revision: version.revision + 1,
    };
    this.state.masterVersions.set(version.id, updated);
    this.persist();
    return structuredClone(updated);
  }

  async publishMaster(input: PublishMasterInput): Promise<AdminMaster> {
    this.refresh();
    requireAdmin(this.state, input.actorId);
    const master = this.state.masters.get(input.masterId);
    const version = this.state.masterVersions.get(input.versionId);
    if (!master || !version || version.masterSlideId !== master.id) {
      throw new StoreError('not_found', 'Master version not found');
    }
    if (version.status !== 'draft') {
      throw new StoreError('invalid', 'Only a draft can be published');
    }
    if (version.revision !== input.expectedRevision) {
      throw new StoreError(
        'conflict',
        'The master draft changed in another session',
        version.revision,
      );
    }
    const published: MasterSlideVersion = {
      ...version,
      status: 'published',
      revision: version.revision + 1,
      publishedAt: isoNow(),
    };
    const updatedMaster = {
      ...master,
      currentPublishedVersionId: published.id,
      updatedAt: isoNow(),
    };
    this.state.masterVersions.set(published.id, published);
    this.state.masters.set(master.id, updatedMaster);
    this.persist();
    return adminMaster(this.state, updatedMaster);
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
