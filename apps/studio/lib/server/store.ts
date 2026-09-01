import type { SlideDocument } from '@open-slide/document';
import type {
  Deck,
  DeckAccess,
  DeckMember,
  DeckRole,
  DeckSummary,
  PublishedMaster,
  StudioAsset,
  StudioUser,
} from '@/lib/models';

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

export type DeckSlideMutation =
  | {
      operation: 'update';
      slideId: string;
      document?: SlideDocument;
      notes?: string;
    }
  | {
      operation: 'insert';
      slideId: string;
      afterSlideId: string | null;
      document: SlideDocument;
      masterSlideId: string | null;
      masterVersionId: string | null;
    }
  | { operation: 'duplicate'; slideId: string; newSlideId: string; document: SlideDocument }
  | { operation: 'delete'; slideId: string }
  | { operation: 'reorder'; slideIds: string[] }
  | {
      operation: 'restore';
      slides: Array<{
        id: string;
        document: SlideDocument;
        notes: string;
        masterSlideId: string | null;
        masterVersionId: string | null;
      }>;
    };

export type MutateDeckSlidesInput = {
  actorId: string;
  deckId: string;
  expectedRevision: number;
  mutation: DeckSlideMutation;
};

export type RecordAssetInput = {
  id: string;
  ownerId: string;
  deckId: string;
  blobUrl: string;
  pathname: string;
  contentType: string;
  width: number | null;
  height: number | null;
  size: number;
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
  mutateDeckSlides(input: MutateDeckSlidesInput): Promise<DeckAccess>;
  listPublishedMasters(userId: string, librarySlug: string): Promise<PublishedMaster[]>;
  getPublishedMaster(userId: string, versionId: string): Promise<PublishedMaster | null>;
  recordAsset(input: RecordAssetInput): Promise<StudioAsset>;
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
