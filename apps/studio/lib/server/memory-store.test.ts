import {
  cloneMasterDocument,
  createBlankSlideDocument,
  createPreviewMasterCatalog,
} from '@open-slide/document';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryStudioStore, resetMemoryStore } from './memory-store';
import type { StoreError } from './store';

const owner = {
  id: 'user:owner',
  email: 'owner@vercel.com',
  name: 'Owner',
  username: 'owner',
  avatarUrl: null,
  role: 'user' as const,
};
const collaborator = {
  id: 'user:collaborator',
  email: 'collaborator@vercel.com',
  name: 'Collaborator',
  username: 'collaborator',
  avatarUrl: null,
  role: 'user' as const,
};
const admin = {
  id: 'user:admin',
  email: 'admin@vercel.com',
  name: 'Admin',
  username: 'admin',
  avatarUrl: null,
  role: 'admin' as const,
};

beforeEach(() => resetMemoryStore());

describe('deck authorization and revisions', () => {
  it('does not expose a private deck to another user', async () => {
    const store = new MemoryStudioStore();
    await store.ensureUser(owner);
    await store.ensureUser(collaborator);
    await store.createDeck({
      id: 'deck:private',
      ownerId: owner.id,
      title: 'Private',
      templateLibraryId: 'library:vercel',
      slides: [],
    });
    expect(await store.getDeckAccess(collaborator.id, 'deck:private')).toBeNull();
  });

  it('keeps viewers read-only and lets editors mutate with revision checks', async () => {
    const store = new MemoryStudioStore();
    await store.ensureUser(owner);
    await store.ensureUser(collaborator);
    const deck = await store.createDeck({
      id: 'deck:shared',
      ownerId: owner.id,
      title: 'Shared',
      templateLibraryId: 'library:vercel',
      slides: [],
    });
    await store.shareDeck({
      actorId: owner.id,
      deckId: deck.id,
      email: collaborator.email,
      role: 'viewer',
    });
    await expect(
      store.updateDeck({
        actorId: collaborator.id,
        deckId: deck.id,
        expectedRevision: 0,
        title: 'Viewer edit',
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });

    await store.shareDeck({
      actorId: owner.id,
      deckId: deck.id,
      email: collaborator.email,
      role: 'editor',
    });
    const updated = await store.updateDeck({
      actorId: collaborator.id,
      deckId: deck.id,
      expectedRevision: 0,
      title: 'Editor edit',
    });
    expect(updated).toMatchObject({ title: 'Editor edit', revision: 1 });
    await expect(
      store.updateDeck({
        actorId: owner.id,
        deckId: deck.id,
        expectedRevision: 0,
        title: 'Stale edit',
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<StoreError>>({ code: 'conflict', currentRevision: 1 }),
    );
  });

  it('converts an email invite into membership when the user first signs in', async () => {
    const store = new MemoryStudioStore();
    await store.ensureUser(owner);
    const deck = await store.createDeck({
      id: 'deck:invite',
      ownerId: owner.id,
      title: 'Invite',
      templateLibraryId: 'library:vercel',
      slides: [],
    });
    const invite = await store.shareDeck({
      actorId: owner.id,
      deckId: deck.id,
      email: collaborator.email,
      role: 'editor',
    });
    expect(invite.pending).toBe(true);
    await store.ensureUser(collaborator);
    expect(await store.getDeckAccess(collaborator.id, deck.id)).toMatchObject({ role: 'editor' });
  });

  it('rejects viewer and stale slide mutations', async () => {
    const store = new MemoryStudioStore();
    await store.ensureUser(owner);
    await store.ensureUser(collaborator);
    const document = createBlankSlideDocument('slide:one');
    const deck = await store.createDeck({
      id: 'deck:mutations',
      ownerId: owner.id,
      title: 'Mutations',
      templateLibraryId: 'library:vercel',
      slides: [
        {
          id: 'slide:one',
          document,
          notes: '',
          masterSlideId: null,
          masterVersionId: null,
        },
      ],
    });
    await store.shareDeck({
      actorId: owner.id,
      deckId: deck.id,
      email: collaborator.email,
      role: 'viewer',
    });
    await expect(
      store.mutateDeckSlides({
        actorId: collaborator.id,
        deckId: deck.id,
        expectedRevision: 0,
        mutation: { operation: 'delete', slideId: 'slide:one' },
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
    const updated = await store.mutateDeckSlides({
      actorId: owner.id,
      deckId: deck.id,
      expectedRevision: 0,
      mutation: { operation: 'update', slideId: 'slide:one', notes: 'Saved' },
    });
    expect(updated.deck.revision).toBe(1);
    await expect(
      store.mutateDeckSlides({
        actorId: owner.id,
        deckId: deck.id,
        expectedRevision: 0,
        mutation: { operation: 'update', slideId: 'slide:one', notes: 'Stale' },
      }),
    ).rejects.toMatchObject({ code: 'conflict', currentRevision: 1 });
  });

  it('inserts an independent master copy and restores structural history', async () => {
    const store = new MemoryStudioStore();
    await store.ensureUser(owner);
    const deck = await store.createDeck({
      id: 'deck:master-copy',
      ownerId: owner.id,
      title: 'Master copy',
      templateLibraryId: 'library:vercel',
      slides: [],
    });
    const master = createPreviewMasterCatalog()[0];
    const document = cloneMasterDocument(master.document, 'slide:copy', (id) => `copy:${id}`);
    const inserted = await store.mutateDeckSlides({
      actorId: owner.id,
      deckId: deck.id,
      expectedRevision: 0,
      mutation: {
        operation: 'insert',
        slideId: 'slide:copy',
        afterSlideId: null,
        document,
        masterSlideId: master.id,
        masterVersionId: master.versionId,
      },
    });
    inserted.slides[0].document.elements[0].x += 100;
    expect(master.document.elements[0].x).not.toBe(inserted.slides[0].document.elements[0].x);
    const restored = await store.mutateDeckSlides({
      actorId: owner.id,
      deckId: deck.id,
      expectedRevision: 1,
      mutation: { operation: 'restore', slides: [] },
    });
    expect(restored.slides).toHaveLength(0);
    expect(restored.deck.revision).toBe(2);
  });

  it('enforces admin access and publishes immutable master versions', async () => {
    const store = new MemoryStudioStore();
    await store.ensureUser(owner);
    await store.ensureUser(admin);
    await expect(store.listAdminMasters(owner.id, 'vercel')).rejects.toMatchObject({
      code: 'forbidden',
    });

    const source = (await store.listAdminMasters(admin.id, 'vercel'))[0];
    const published = source.versions.find(
      (version) => version.id === source.currentPublishedVersionId,
    );
    expect(published).toBeDefined();
    if (!published) return;
    const deck = await store.createDeck({
      id: 'deck:published-isolation',
      ownerId: owner.id,
      title: 'Published isolation',
      templateLibraryId: 'library:vercel',
      slides: [
        {
          id: 'slide:published-copy',
          document: cloneMasterDocument(
            published.document,
            'slide:published-copy',
            (id) => `copy:${id}`,
          ),
          notes: '',
          masterSlideId: source.id,
          masterVersionId: published.id,
        },
      ],
    });
    const before = await store.getDeckAccess(owner.id, deck.id);
    const draft = await store.createMasterDraft({
      actorId: admin.id,
      masterId: source.id,
      versionId: 'master-version:test:draft',
      sourceVersionId: published.id,
    });
    const editedDocument = {
      ...draft.document,
      elements: draft.document.elements.map((element, index) =>
        index === 0 ? { ...element, x: element.x + 40 } : element,
      ),
    };
    const updatedDraft = await store.updateMasterDraft({
      actorId: admin.id,
      masterId: source.id,
      versionId: draft.id,
      expectedRevision: 0,
      document: editedDocument,
    });
    await expect(
      store.updateMasterDraft({
        actorId: admin.id,
        masterId: source.id,
        versionId: draft.id,
        expectedRevision: 0,
        document: editedDocument,
      }),
    ).rejects.toMatchObject({ code: 'conflict', currentRevision: 1 });
    const afterPublish = await store.publishMaster({
      actorId: admin.id,
      masterId: source.id,
      versionId: draft.id,
      expectedRevision: updatedDraft.revision,
    });
    expect(afterPublish.currentPublishedVersionId).toBe(draft.id);
    const current = await store.getPublishedMaster(owner.id, draft.id);
    expect(current?.version.document.elements[0].x).toBe(published.document.elements[0].x + 40);
    const after = await store.getDeckAccess(owner.id, deck.id);
    expect(after?.slides[0].document).toEqual(before?.slides[0].document);
    await expect(
      store.updateMasterDraft({
        actorId: admin.id,
        masterId: source.id,
        versionId: draft.id,
        expectedRevision: updatedDraft.revision + 1,
        document: editedDocument,
      }),
    ).rejects.toMatchObject({ code: 'invalid' });
  });
});
