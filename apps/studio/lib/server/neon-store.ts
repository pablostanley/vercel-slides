import { neon } from '@neondatabase/serverless';
import { migrateSlideDocument } from '@open-slide/document';
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

type Row = Record<string, unknown>;

let queryClient: ReturnType<typeof neon> | null = null;

function getClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required for the Neon studio store');
  queryClient ??= neon(databaseUrl);
  return queryClient;
}

async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  return (await getClient().query(text, params)) as Row[];
}

function stringValue(value: unknown) {
  return String(value);
}

function nullableString(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function isoValue(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function mapUser(row: Row): StudioUser {
  return {
    id: stringValue(row.id),
    email: stringValue(row.email),
    name: stringValue(row.name),
    username: nullableString(row.username),
    avatarUrl: nullableString(row.avatar_url),
    role: row.role === 'admin' ? 'admin' : 'user',
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

function mapDeck(row: Row): Deck {
  return {
    id: stringValue(row.id),
    ownerId: stringValue(row.owner_id),
    title: stringValue(row.title),
    templateLibraryId: nullableString(row.template_library_id),
    theme: (row.theme_json ?? {}) as Record<string, unknown>,
    visibility: row.visibility as Deck['visibility'],
    status: row.status as Deck['status'],
    revision: Number(row.revision),
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

function mapSlide(row: Row): DeckSlide {
  return {
    id: stringValue(row.id),
    deckId: stringValue(row.deck_id),
    position: Number(row.position),
    masterSlideId: nullableString(row.master_slide_id),
    masterVersionId: nullableString(row.master_version_id),
    schemaVersion: Number(row.schema_version),
    document: migrateSlideDocument(row.document_json),
    notes: stringValue(row.notes ?? ''),
    revision: Number(row.revision),
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

async function requireAccess(userId: string, deckId: string) {
  const rows = await query(
    `SELECT d.*, CASE WHEN d.owner_id = $1 THEN 'owner' ELSE dm.role END AS access_role
     FROM decks d
     LEFT JOIN deck_members dm ON dm.deck_id = d.id AND dm.user_id = $1
     WHERE d.id = $2 AND (d.owner_id = $1 OR dm.user_id IS NOT NULL)`,
    [userId, deckId],
  );
  const row = rows[0];
  if (!row) throw new StoreError('forbidden', 'You do not have access to this presentation');
  return { deck: mapDeck(row), role: row.access_role as DeckRole };
}

export class NeonStudioStore implements StudioStore {
  async ensureUser(identity: IdentityInput): Promise<StudioUser> {
    const rows = await query(
      `WITH upserted AS (
         INSERT INTO users(id, email, name, username, avatar_url, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           username = EXCLUDED.username,
           avatar_url = EXCLUDED.avatar_url,
           role = EXCLUDED.role,
           updated_at = now()
         RETURNING *
       ), accepted AS (
         INSERT INTO deck_members(deck_id, user_id, role, created_at)
         SELECT deck_id, $1, role, created_at FROM deck_invites WHERE lower(email) = lower($2)
         ON CONFLICT (deck_id, user_id) DO UPDATE SET role = EXCLUDED.role
       ), removed AS (
         DELETE FROM deck_invites WHERE lower(email) = lower($2)
       )
       SELECT * FROM upserted`,
      [
        identity.id,
        identity.email,
        identity.name,
        identity.username,
        identity.avatarUrl,
        identity.role,
      ],
    );
    const row = rows[0];
    if (!row) throw new Error('Failed to synchronize studio user');
    return mapUser(row);
  }

  async listDecks(userId: string): Promise<DeckSummary[]> {
    const rows = await query(
      `SELECT d.*,
         CASE WHEN d.owner_id = $1 THEN 'owner' ELSE dm.role END AS access_role,
         (SELECT count(*)::int FROM deck_slides ds WHERE ds.deck_id = d.id) AS slide_count,
         fs.id AS first_id,
         fs.deck_id AS first_deck_id,
         fs.position AS first_position,
         fs.master_slide_id AS first_master_slide_id,
         fs.master_version_id AS first_master_version_id,
         fs.schema_version AS first_schema_version,
         fs.document_json AS first_document_json,
         fs.notes AS first_notes,
         fs.revision AS first_revision,
         fs.created_at AS first_created_at,
         fs.updated_at AS first_updated_at
       FROM decks d
       LEFT JOIN deck_members dm ON dm.deck_id = d.id AND dm.user_id = $1
       LEFT JOIN LATERAL (
         SELECT * FROM deck_slides WHERE deck_id = d.id ORDER BY position LIMIT 1
       ) fs ON true
       WHERE d.owner_id = $1 OR dm.user_id IS NOT NULL
       ORDER BY d.updated_at DESC`,
      [userId],
    );
    return rows.map((row) => ({
      ...mapDeck(row),
      role: row.access_role as DeckRole,
      slideCount: Number(row.slide_count),
      firstSlide:
        row.first_id === null
          ? null
          : mapSlide({
              id: row.first_id,
              deck_id: row.first_deck_id,
              position: row.first_position,
              master_slide_id: row.first_master_slide_id,
              master_version_id: row.first_master_version_id,
              schema_version: row.first_schema_version,
              document_json: row.first_document_json,
              notes: row.first_notes,
              revision: row.first_revision,
              created_at: row.first_created_at,
              updated_at: row.first_updated_at,
            }),
    }));
  }

  async createDeck(input: CreateDeckInput): Promise<Deck> {
    const slidePayload = input.slides.map((slide, position) => ({
      id: slide.id,
      position,
      master_slide_id: slide.masterSlideId,
      master_version_id: slide.masterVersionId,
      schema_version: slide.document.schemaVersion,
      document_json: slide.document,
      notes: slide.notes,
    }));
    const rows = await query(
      `WITH library AS (
         INSERT INTO template_libraries(id, slug, title, description)
         SELECT 'library:vercel', 'vercel', 'Vercel', 'Published Vercel presentation masters'
         WHERE $4::text IS NOT NULL
         ON CONFLICT (id) DO NOTHING
       ), created_deck AS (
         INSERT INTO decks(id, owner_id, title, template_library_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *
       ), created_slides AS (
         INSERT INTO deck_slides(
           id, deck_id, position, master_slide_id, master_version_id, schema_version, document_json, notes
         )
         SELECT
           slide.id, $1, slide.position, slide.master_slide_id, slide.master_version_id,
           slide.schema_version, slide.document_json, slide.notes
         FROM jsonb_to_recordset($5::jsonb) AS slide(
           id text, position integer, master_slide_id text, master_version_id text,
           schema_version integer, document_json jsonb, notes text
         )
       )
       SELECT * FROM created_deck`,
      [input.id, input.ownerId, input.title, input.templateLibraryId, JSON.stringify(slidePayload)],
    );
    const row = rows[0];
    if (!row) throw new Error('Failed to create presentation');
    return mapDeck(row);
  }

  async getDeckAccess(userId: string, deckId: string): Promise<DeckAccess | null> {
    try {
      const { deck, role } = await requireAccess(userId, deckId);
      const slides = await query('SELECT * FROM deck_slides WHERE deck_id = $1 ORDER BY position', [
        deckId,
      ]);
      return { deck, role, slides: slides.map(mapSlide) };
    } catch (error) {
      if (error instanceof StoreError && error.code === 'forbidden') return null;
      throw error;
    }
  }

  async updateDeck(input: UpdateDeckInput): Promise<Deck> {
    const access = await requireAccess(input.actorId, input.deckId);
    if (access.role === 'viewer') throw new StoreError('forbidden', 'Viewer access is read-only');
    if (input.status !== undefined && !isOwner(access.role)) {
      throw new StoreError('forbidden', 'Only the owner can archive a presentation');
    }
    const rows = await query(
      `UPDATE decks SET
         title = COALESCE($4, title),
         visibility = COALESCE($5, visibility),
         status = COALESCE($6, status),
         revision = revision + 1,
         updated_at = now()
       WHERE id = $1 AND revision = $2
         AND (owner_id = $3 OR EXISTS (
           SELECT 1 FROM deck_members WHERE deck_id = $1 AND user_id = $3 AND role = 'editor'
         ))
       RETURNING *`,
      [
        input.deckId,
        input.expectedRevision,
        input.actorId,
        input.title ?? null,
        input.visibility ?? null,
        input.status ?? null,
      ],
    );
    const row = rows[0];
    if (!row) {
      const current = await requireAccess(input.actorId, input.deckId);
      throw new StoreError(
        'conflict',
        'The presentation changed in another session',
        current.deck.revision,
      );
    }
    const deck = mapDeck(row);
    await query(
      `INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
       VALUES ($1, $2, 'update-deck', $3, $4::jsonb)`,
      [deck.id, deck.revision, input.actorId, JSON.stringify(input)],
    );
    return deck;
  }

  async deleteDeck(actorId: string, deckId: string): Promise<void> {
    const rows = await query('DELETE FROM decks WHERE id = $1 AND owner_id = $2 RETURNING id', [
      deckId,
      actorId,
    ]);
    if (!rows[0]) throw new StoreError('forbidden', 'Only the owner can delete a presentation');
  }

  async listMembers(actorId: string, deckId: string): Promise<DeckMember[]> {
    await requireAccess(actorId, deckId);
    const rows = await query(
      `SELECT dm.deck_id, dm.user_id, u.email, u.name, u.avatar_url, dm.role, false AS pending,
         dm.created_at
       FROM deck_members dm JOIN users u ON u.id = dm.user_id WHERE dm.deck_id = $1
       UNION ALL
       SELECT di.deck_id, NULL AS user_id, di.email, NULL AS name, NULL AS avatar_url, di.role,
         true AS pending, di.created_at
       FROM deck_invites di WHERE di.deck_id = $1
       ORDER BY created_at`,
      [deckId],
    );
    return rows.map((row) => ({
      deckId: stringValue(row.deck_id),
      userId: nullableString(row.user_id),
      email: stringValue(row.email),
      name: nullableString(row.name),
      avatarUrl: nullableString(row.avatar_url),
      role: row.role as DeckMember['role'],
      pending: Boolean(row.pending),
      createdAt: isoValue(row.created_at),
    }));
  }

  async shareDeck(input: ShareDeckInput): Promise<DeckMember> {
    const access = await requireAccess(input.actorId, input.deckId);
    if (!isOwner(access.role))
      throw new StoreError('forbidden', 'Only the owner can manage sharing');
    const email = input.email.trim().toLowerCase();
    const userRows = await query('SELECT * FROM users WHERE lower(email) = $1', [email]);
    const user = userRows[0];
    if (user) {
      const rows = await query(
        `INSERT INTO deck_members(deck_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (deck_id, user_id) DO UPDATE SET role = EXCLUDED.role
         RETURNING *`,
        [input.deckId, user.id, input.role],
      );
      await query('DELETE FROM deck_invites WHERE deck_id = $1 AND lower(email) = $2', [
        input.deckId,
        email,
      ]);
      const row = rows[0];
      return {
        deckId: input.deckId,
        userId: stringValue(user.id),
        email,
        name: stringValue(user.name),
        avatarUrl: nullableString(user.avatar_url),
        role: input.role,
        pending: false,
        createdAt: isoValue(row?.created_at),
      };
    }
    const rows = await query(
      `INSERT INTO deck_invites(deck_id, email, role, invited_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (deck_id, email) DO UPDATE SET role = EXCLUDED.role, invited_by = EXCLUDED.invited_by
       RETURNING *`,
      [input.deckId, email, input.role, input.actorId],
    );
    const row = rows[0];
    return {
      deckId: input.deckId,
      userId: null,
      email,
      name: null,
      avatarUrl: null,
      role: input.role,
      pending: true,
      createdAt: isoValue(row?.created_at),
    };
  }

  async unshareDeck(actorId: string, deckId: string, email: string): Promise<void> {
    const access = await requireAccess(actorId, deckId);
    if (!isOwner(access.role))
      throw new StoreError('forbidden', 'Only the owner can manage sharing');
    const normalizedEmail = email.trim().toLowerCase();
    await query(
      `DELETE FROM deck_members dm USING users u
       WHERE dm.deck_id = $1 AND dm.user_id = u.id AND lower(u.email) = $2`,
      [deckId, normalizedEmail],
    );
    await query('DELETE FROM deck_invites WHERE deck_id = $1 AND lower(email) = $2', [
      deckId,
      normalizedEmail,
    ]);
  }
}
