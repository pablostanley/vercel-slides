import type { SlideDocument } from '@open-slide/document';

export type UserRole = 'user' | 'admin';
export type DeckRole = 'owner' | 'editor' | 'viewer';
export type DeckVisibility = 'private' | 'team' | 'link';
export type DeckStatus = 'active' | 'archived';

export type StudioUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Deck = {
  id: string;
  ownerId: string;
  title: string;
  templateLibraryId: string | null;
  theme: Record<string, unknown>;
  visibility: DeckVisibility;
  status: DeckStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type DeckSlide = {
  id: string;
  deckId: string;
  position: number;
  masterSlideId: string | null;
  masterVersionId: string | null;
  schemaVersion: number;
  document: SlideDocument;
  notes: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type DeckAccess = {
  deck: Deck;
  slides: DeckSlide[];
  role: DeckRole;
};

export type DeckSummary = Deck & {
  role: DeckRole;
  firstSlide: DeckSlide | null;
  slideCount: number;
};

export type DeckMember = {
  deckId: string;
  userId: string | null;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Exclude<DeckRole, 'owner'>;
  pending: boolean;
  createdAt: string;
};

export type TemplateLibrary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type MasterSlide = {
  id: string;
  libraryId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  position: number;
  currentPublishedVersionId: string | null;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type MasterSlideVersion = {
  id: string;
  masterSlideId: string;
  version: number;
  schemaVersion: number;
  document: SlideDocument;
  thumbnail: Record<string, unknown> | null;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  publishedAt: string | null;
};
