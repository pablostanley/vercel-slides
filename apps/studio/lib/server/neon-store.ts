import { neon } from '@neondatabase/serverless';
import { migrateSlideDocument } from '@open-slide/document';
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

function mapPublishedMaster(row: Row): PublishedMaster {
  return {
    id: stringValue(row.id),
    libraryId: stringValue(row.library_id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    description: stringValue(row.description),
    category: stringValue(row.category),
    tags: (row.tags ?? []) as string[],
    position: Number(row.position),
    currentPublishedVersionId: stringValue(row.current_published_version_id),
    status: 'active',
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
    version: {
      id: stringValue(row.version_id),
      masterSlideId: stringValue(row.id),
      version: Number(row.version),
      schemaVersion: Number(row.version_schema_version),
      document: migrateSlideDocument(row.document_json),
      thumbnail: (row.thumbnail_json as Record<string, unknown> | null) ?? null,
      createdBy: stringValue(row.created_by),
      status: 'published',
      revision: Number(row.version_revision ?? 0),
      createdAt: isoValue(row.version_created_at),
      publishedAt: isoValue(row.published_at),
    },
  };
}

function mapMaster(row: Row): MasterSlide {
  return {
    id: stringValue(row.id),
    libraryId: stringValue(row.library_id),
    slug: stringValue(row.slug),
    title: stringValue(row.title),
    description: stringValue(row.description),
    category: stringValue(row.category),
    tags: (row.tags ?? []) as string[],
    position: Number(row.position),
    currentPublishedVersionId: nullableString(row.current_published_version_id),
    status: row.status === 'archived' ? 'archived' : 'active',
    createdAt: isoValue(row.created_at),
    updatedAt: isoValue(row.updated_at),
  };
}

function mapMasterVersion(row: Row): MasterSlideVersion {
  return {
    id: stringValue(row.id),
    masterSlideId: stringValue(row.master_slide_id),
    version: Number(row.version),
    schemaVersion: Number(row.schema_version),
    document: migrateSlideDocument(row.document_json),
    thumbnail: (row.thumbnail_json as Record<string, unknown> | null) ?? null,
    createdBy: stringValue(row.created_by),
    status: row.status as MasterSlideVersion['status'],
    revision: Number(row.revision ?? 0),
    createdAt: isoValue(row.created_at),
    publishedAt: row.published_at ? isoValue(row.published_at) : null,
  };
}

function mapAsset(row: Row): StudioAsset {
  return {
    id: stringValue(row.id),
    ownerId: stringValue(row.owner_id),
    deckId: nullableString(row.deck_id),
    blobUrl: stringValue(row.blob_url),
    pathname: stringValue(row.pathname),
    contentType: stringValue(row.content_type),
    width: row.width === null ? null : Number(row.width),
    height: row.height === null ? null : Number(row.height),
    size: Number(row.size),
    createdAt: isoValue(row.created_at),
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

async function requireAdmin(actorId: string) {
  const rows = await query('SELECT role FROM users WHERE id = $1', [actorId]);
  if (rows[0]?.role !== 'admin') {
    throw new StoreError('forbidden', 'Administrator access is required');
  }
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

  async mutateDeckSlides(input: MutateDeckSlidesInput): Promise<DeckAccess> {
    const mutation = input.mutation;
    let rows: Row[] = [];
    if (mutation.operation === 'update') {
      rows = await query(
        `WITH authorized AS (
           UPDATE decks d SET revision = revision + 1, updated_at = now()
           WHERE d.id = $1 AND d.revision = $2
             AND (d.owner_id = $3 OR EXISTS (
               SELECT 1 FROM deck_members WHERE deck_id = d.id AND user_id = $3 AND role = 'editor'
             ))
             AND EXISTS (SELECT 1 FROM deck_slides WHERE id = $4 AND deck_id = d.id)
           RETURNING d.*
         ), changed AS (
           UPDATE deck_slides SET
             document_json = COALESCE($5::jsonb, document_json),
             schema_version = COALESCE($6, schema_version),
             notes = COALESCE($7, notes), revision = revision + 1, updated_at = now()
           WHERE id = $4 AND deck_id IN (SELECT id FROM authorized)
           RETURNING id
         ), audit AS (
           INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
           SELECT id, revision, 'update-slide', $3, jsonb_build_object('slideId', $4)
           FROM authorized
         ) SELECT * FROM authorized`,
        [
          input.deckId,
          input.expectedRevision,
          input.actorId,
          mutation.slideId,
          mutation.document ? JSON.stringify(mutation.document) : null,
          mutation.document?.schemaVersion ?? null,
          mutation.notes ?? null,
        ],
      );
    } else if (mutation.operation === 'insert') {
      rows = await query(
        `WITH target AS (
           SELECT COALESCE((SELECT position FROM deck_slides WHERE id = $4 AND deck_id = $1), -1) AS position
         ), authorized AS (
           UPDATE decks d SET revision = revision + 1, updated_at = now()
           WHERE d.id = $1 AND d.revision = $2
             AND (d.owner_id = $3 OR EXISTS (
               SELECT 1 FROM deck_members WHERE deck_id = d.id AND user_id = $3 AND role = 'editor'
             ))
             AND ($4::text IS NULL OR EXISTS (
               SELECT 1 FROM deck_slides WHERE id = $4 AND deck_id = d.id
             ))
           RETURNING d.*
         ), shifted AS (
           UPDATE deck_slides SET position = position + 1
           WHERE deck_id IN (SELECT id FROM authorized)
             AND position > (SELECT position FROM target)
         ), inserted AS (
           INSERT INTO deck_slides(
             id, deck_id, position, master_slide_id, master_version_id, schema_version, document_json
           )
           SELECT $5, id, (SELECT position + 1 FROM target), $6, $7, $8, $9::jsonb
           FROM authorized
           RETURNING id
         ), audit AS (
           INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
           SELECT id, revision, 'insert-slide', $3, jsonb_build_object('slideId', $5)
           FROM authorized
         ) SELECT * FROM authorized`,
        [
          input.deckId,
          input.expectedRevision,
          input.actorId,
          mutation.afterSlideId,
          mutation.slideId,
          mutation.masterSlideId,
          mutation.masterVersionId,
          mutation.document.schemaVersion,
          JSON.stringify(mutation.document),
        ],
      );
    } else if (mutation.operation === 'duplicate') {
      rows = await query(
        `WITH source AS (
           SELECT * FROM deck_slides WHERE id = $4 AND deck_id = $1
         ), authorized AS (
           UPDATE decks d SET revision = revision + 1, updated_at = now()
           WHERE d.id = $1 AND d.revision = $2
             AND (d.owner_id = $3 OR EXISTS (
               SELECT 1 FROM deck_members WHERE deck_id = d.id AND user_id = $3 AND role = 'editor'
             )) AND EXISTS (SELECT 1 FROM source)
           RETURNING d.*
         ), shifted AS (
           UPDATE deck_slides SET position = position + 1
           WHERE deck_id IN (SELECT id FROM authorized)
             AND position > (SELECT position FROM source)
         ), inserted AS (
           INSERT INTO deck_slides(
             id, deck_id, position, master_slide_id, master_version_id,
             schema_version, document_json, notes
           )
           SELECT $5, deck_id, position + 1, master_slide_id, master_version_id,
             $6, $7::jsonb, notes FROM source
           WHERE deck_id IN (SELECT id FROM authorized)
           RETURNING id
         ), audit AS (
           INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
           SELECT id, revision, 'duplicate-slide', $3, jsonb_build_object('slideId', $4, 'newSlideId', $5)
           FROM authorized
         ) SELECT * FROM authorized`,
        [
          input.deckId,
          input.expectedRevision,
          input.actorId,
          mutation.slideId,
          mutation.newSlideId,
          mutation.document.schemaVersion,
          JSON.stringify(mutation.document),
        ],
      );
    } else if (mutation.operation === 'delete') {
      rows = await query(
        `WITH authorized AS (
           UPDATE decks d SET revision = revision + 1, updated_at = now()
           WHERE d.id = $1 AND d.revision = $2
             AND (d.owner_id = $3 OR EXISTS (
               SELECT 1 FROM deck_members WHERE deck_id = d.id AND user_id = $3 AND role = 'editor'
             ))
             AND EXISTS (SELECT 1 FROM deck_slides WHERE id = $4 AND deck_id = d.id)
           RETURNING d.*
         ), deleted AS (
           DELETE FROM deck_slides WHERE id = $4 AND deck_id IN (SELECT id FROM authorized)
         ), ordered AS (
           SELECT id, row_number() OVER (ORDER BY position) - 1 AS next_position
           FROM deck_slides WHERE deck_id IN (SELECT id FROM authorized)
         ), normalized AS (
           UPDATE deck_slides ds SET position = ordered.next_position
           FROM ordered WHERE ds.id = ordered.id
         ), audit AS (
           INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
           SELECT id, revision, 'delete-slide', $3, jsonb_build_object('slideId', $4)
           FROM authorized
         ) SELECT * FROM authorized`,
        [input.deckId, input.expectedRevision, input.actorId, mutation.slideId],
      );
    } else if (mutation.operation === 'reorder') {
      rows = await query(
        `WITH requested AS (
           SELECT slide_id, ordinality - 1 AS position
           FROM unnest($4::text[]) WITH ORDINALITY AS slides(slide_id, ordinality)
         ), authorized AS (
           UPDATE decks d SET revision = revision + 1, updated_at = now()
           WHERE d.id = $1 AND d.revision = $2
             AND (d.owner_id = $3 OR EXISTS (
               SELECT 1 FROM deck_members WHERE deck_id = d.id AND user_id = $3 AND role = 'editor'
             ))
             AND (SELECT count(*) FROM deck_slides WHERE deck_id = d.id) = cardinality($4::text[])
             AND NOT EXISTS (
               SELECT 1 FROM requested r
               WHERE NOT EXISTS (SELECT 1 FROM deck_slides WHERE id = r.slide_id AND deck_id = d.id)
             )
           RETURNING d.*
         ), reordered AS (
           UPDATE deck_slides ds SET position = requested.position
           FROM requested
           WHERE ds.id = requested.slide_id AND ds.deck_id IN (SELECT id FROM authorized)
         ), audit AS (
           INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
           SELECT id, revision, 'reorder-slides', $3, jsonb_build_object('slideIds', $4::text[])
           FROM authorized
         ) SELECT * FROM authorized`,
        [input.deckId, input.expectedRevision, input.actorId, mutation.slideIds],
      );
    } else {
      const payload = mutation.slides.map((slide, position) => ({
        id: slide.id,
        position,
        master_slide_id: slide.masterSlideId,
        master_version_id: slide.masterVersionId,
        schema_version: slide.document.schemaVersion,
        document_json: slide.document,
        notes: slide.notes,
      }));
      rows = await query(
        `WITH requested AS (
           SELECT * FROM jsonb_to_recordset($4::jsonb) AS slide(
             id text, position integer, master_slide_id text, master_version_id text,
             schema_version integer, document_json jsonb, notes text
           )
         ), authorized AS (
           UPDATE decks d SET revision = revision + 1, updated_at = now()
           WHERE d.id = $1 AND d.revision = $2
             AND (d.owner_id = $3 OR EXISTS (
               SELECT 1 FROM deck_members WHERE deck_id = d.id AND user_id = $3 AND role = 'editor'
             ))
             AND (SELECT count(DISTINCT id) FROM requested) = jsonb_array_length($4::jsonb)
             AND NOT EXISTS (
               SELECT 1 FROM requested
               JOIN deck_slides existing ON existing.id = requested.id
               WHERE existing.deck_id <> d.id
             )
           RETURNING d.*
         ), removed AS (
           DELETE FROM deck_slides ds
           WHERE ds.deck_id IN (SELECT id FROM authorized)
             AND NOT EXISTS (SELECT 1 FROM requested WHERE requested.id = ds.id)
         ), restored AS (
           INSERT INTO deck_slides(
             id, deck_id, position, master_slide_id, master_version_id,
             schema_version, document_json, notes
           )
           SELECT requested.id, $1, requested.position, requested.master_slide_id,
             requested.master_version_id, requested.schema_version,
             requested.document_json, requested.notes
           FROM requested WHERE EXISTS (SELECT 1 FROM authorized)
           ON CONFLICT (id) DO UPDATE SET
             position = EXCLUDED.position,
             master_slide_id = EXCLUDED.master_slide_id,
             master_version_id = EXCLUDED.master_version_id,
             schema_version = EXCLUDED.schema_version,
             document_json = EXCLUDED.document_json,
             notes = EXCLUDED.notes,
             revision = deck_slides.revision + 1,
             updated_at = now()
           WHERE deck_slides.deck_id = EXCLUDED.deck_id
         ), audit AS (
           INSERT INTO deck_revisions(deck_id, revision, operation, actor_id, payload)
           SELECT id, revision, 'restore-slides', $3, jsonb_build_object('slideCount', jsonb_array_length($4::jsonb))
           FROM authorized
         ) SELECT * FROM authorized`,
        [input.deckId, input.expectedRevision, input.actorId, JSON.stringify(payload)],
      );
    }
    if (!rows[0]) {
      const access = await requireAccess(input.actorId, input.deckId);
      if (access.role === 'viewer') throw new StoreError('forbidden', 'Viewer access is read-only');
      if (access.deck.revision !== input.expectedRevision) {
        throw new StoreError(
          'conflict',
          'The presentation changed in another session',
          access.deck.revision,
        );
      }
      throw new StoreError('invalid', 'The slide mutation could not be applied');
    }
    const access = await this.getDeckAccess(input.actorId, input.deckId);
    if (!access) throw new StoreError('not_found', 'Presentation not found');
    return access;
  }

  async listPublishedMasters(_userId: string, librarySlug: string): Promise<PublishedMaster[]> {
    const rows = await query(
      `SELECT ms.*, mv.id AS version_id, mv.version, mv.schema_version AS version_schema_version,
         mv.document_json, mv.thumbnail_json, mv.created_by, mv.revision AS version_revision,
         mv.created_at AS version_created_at,
         mv.published_at
       FROM master_slides ms
       JOIN template_libraries tl ON tl.id = ms.library_id
       JOIN master_slide_versions mv ON mv.id = ms.current_published_version_id
       WHERE tl.slug = $1 AND tl.status = 'active' AND ms.status = 'active'
         AND mv.status = 'published'
       ORDER BY ms.position`,
      [librarySlug],
    );
    return rows.map(mapPublishedMaster);
  }

  async getPublishedMaster(userId: string, versionId: string): Promise<PublishedMaster | null> {
    const masters = await this.listPublishedMasters(userId, 'vercel');
    return masters.find((master) => master.version.id === versionId) ?? null;
  }

  async listAdminMasters(actorId: string, librarySlug: string): Promise<AdminMaster[]> {
    await requireAdmin(actorId);
    const masterRows = await query(
      `SELECT ms.*
       FROM master_slides ms
       JOIN template_libraries tl ON tl.id = ms.library_id
       WHERE tl.slug = $1
       ORDER BY ms.position`,
      [librarySlug],
    );
    if (masterRows.length === 0) return [];
    const masterIds = masterRows.map((row) => stringValue(row.id));
    const versionRows = await query(
      `SELECT * FROM master_slide_versions
       WHERE master_slide_id = ANY($1::text[])
       ORDER BY master_slide_id, version DESC`,
      [masterIds],
    );
    return masterRows.map((row) => {
      const master = mapMaster(row);
      return {
        ...master,
        versions: versionRows
          .filter((version) => stringValue(version.master_slide_id) === master.id)
          .map(mapMasterVersion),
      };
    });
  }

  async getAdminMaster(actorId: string, masterId: string): Promise<AdminMaster | null> {
    await requireAdmin(actorId);
    const masterRows = await query('SELECT * FROM master_slides WHERE id = $1', [masterId]);
    const row = masterRows[0];
    if (!row) return null;
    const versionRows = await query(
      'SELECT * FROM master_slide_versions WHERE master_slide_id = $1 ORDER BY version DESC',
      [masterId],
    );
    return { ...mapMaster(row), versions: versionRows.map(mapMasterVersion) };
  }

  async createMaster(input: CreateMasterInput): Promise<AdminMaster> {
    await requireAdmin(input.actorId);
    const rows = await query(
      `WITH library AS (
         SELECT id FROM template_libraries WHERE slug = $1
       ), next_position AS (
         SELECT COALESCE(MAX(position), -1) + 1 AS position
         FROM master_slides WHERE library_id = (SELECT id FROM library)
       ), inserted_master AS (
         INSERT INTO master_slides(
           id, library_id, slug, title, description, category, tags, position
         )
         SELECT $2, library.id, $3, $4, $5, $6, $7, next_position.position
         FROM library CROSS JOIN next_position
         RETURNING id
       )
       INSERT INTO master_slide_versions(
         id, master_slide_id, version, schema_version, document_json, created_by, status
       )
       SELECT $8, id, 1, $9, $10::jsonb, $11, 'draft' FROM inserted_master
       RETURNING id`,
      [
        input.librarySlug,
        input.id,
        input.slug,
        input.title,
        input.description,
        input.category,
        input.tags,
        input.versionId,
        input.document.schemaVersion,
        JSON.stringify(input.document),
        input.actorId,
      ],
    );
    if (!rows[0]) throw new StoreError('not_found', 'Library not found');
    const master = await this.getAdminMaster(input.actorId, input.id);
    if (!master) throw new Error('Failed to create master');
    return master;
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
    await requireAdmin(input.actorId);
    const rows = await query(
      `UPDATE master_slides SET
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         category = COALESCE($4, category),
         tags = COALESCE($5, tags),
         status = COALESCE($6, status),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        input.masterId,
        input.title ?? null,
        input.description ?? null,
        input.category ?? null,
        input.tags ?? null,
        input.status ?? null,
      ],
    );
    if (!rows[0]) throw new StoreError('not_found', 'Master not found');
    return mapMaster(rows[0]);
  }

  async reorderMasters(actorId: string, librarySlug: string, masterIds: string[]): Promise<void> {
    await requireAdmin(actorId);
    const rows = await query(
      `WITH library AS (
         SELECT id FROM template_libraries WHERE slug = $1
       ), expected AS (
         SELECT COUNT(*)::int AS count FROM master_slides
         WHERE library_id = (SELECT id FROM library)
       ), input AS (
         SELECT id, position
         FROM jsonb_to_recordset($2::jsonb) AS item(id text, position integer)
       ), valid AS (
         SELECT 1
         WHERE (SELECT count FROM expected) = (SELECT COUNT(*) FROM input)
           AND (SELECT COUNT(DISTINCT id) FROM input) = (SELECT count FROM expected)
           AND NOT EXISTS (
             SELECT 1 FROM input
             LEFT JOIN master_slides ms ON ms.id = input.id
               AND ms.library_id = (SELECT id FROM library)
             WHERE ms.id IS NULL
           )
       ), updated AS (
         UPDATE master_slides ms
         SET position = input.position, updated_at = now()
         FROM input, valid
         WHERE ms.id = input.id
         RETURNING ms.id
       ) SELECT COUNT(*) AS count FROM updated`,
      [librarySlug, JSON.stringify(masterIds.map((id, position) => ({ id, position })))],
    );
    if (Number(rows[0]?.count ?? 0) !== masterIds.length) {
      throw new StoreError('invalid', 'Master order must include every master exactly once');
    }
  }

  async createMasterDraft(input: CreateMasterDraftInput): Promise<MasterSlideVersion> {
    await requireAdmin(input.actorId);
    const rows = await query(
      `WITH source AS (
         SELECT * FROM master_slide_versions
         WHERE id = $2 AND master_slide_id = $1
           AND NOT EXISTS (
             SELECT 1 FROM master_slide_versions
             WHERE master_slide_id = $1 AND status = 'draft'
           )
       ), next_version AS (
         SELECT COALESCE(MAX(version), 0) + 1 AS version
         FROM master_slide_versions WHERE master_slide_id = $1
       )
       INSERT INTO master_slide_versions(
         id, master_slide_id, version, schema_version, document_json, thumbnail_json,
         created_by, status, revision
       )
       SELECT $3, $1, next_version.version, source.schema_version, source.document_json,
         source.thumbnail_json, $4, 'draft', 0
       FROM source CROSS JOIN next_version
       RETURNING *`,
      [input.masterId, input.sourceVersionId, input.versionId, input.actorId],
    );
    if (!rows[0]) throw new StoreError('conflict', 'This master already has a draft');
    return mapMasterVersion(rows[0]);
  }

  async updateMasterDraft(input: UpdateMasterDraftInput): Promise<MasterSlideVersion> {
    await requireAdmin(input.actorId);
    const rows = await query(
      `UPDATE master_slide_versions
       SET schema_version = $4, document_json = $5::jsonb, revision = revision + 1
       WHERE id = $2 AND master_slide_id = $1 AND status = 'draft' AND revision = $3
       RETURNING *`,
      [
        input.masterId,
        input.versionId,
        input.expectedRevision,
        input.document.schemaVersion,
        JSON.stringify(input.document),
      ],
    );
    if (!rows[0]) {
      const current = await query(
        'SELECT revision, status FROM master_slide_versions WHERE id = $1 AND master_slide_id = $2',
        [input.versionId, input.masterId],
      );
      if (!current[0]) throw new StoreError('not_found', 'Master version not found');
      if (current[0].status !== 'draft') {
        throw new StoreError('invalid', 'Published master versions are immutable');
      }
      throw new StoreError(
        'conflict',
        'The master draft changed in another session',
        Number(current[0].revision),
      );
    }
    return mapMasterVersion(rows[0]);
  }

  async publishMaster(input: PublishMasterInput): Promise<AdminMaster> {
    await requireAdmin(input.actorId);
    const rows = await query(
      `WITH published AS (
         UPDATE master_slide_versions
         SET status = 'published', published_at = now(), revision = revision + 1
         WHERE id = $2 AND master_slide_id = $1 AND status = 'draft' AND revision = $3
         RETURNING id
       )
       UPDATE master_slides
       SET current_published_version_id = published.id, updated_at = now()
       FROM published WHERE master_slides.id = $1
       RETURNING master_slides.id`,
      [input.masterId, input.versionId, input.expectedRevision],
    );
    if (!rows[0]) {
      const current = await query(
        'SELECT revision, status FROM master_slide_versions WHERE id = $1 AND master_slide_id = $2',
        [input.versionId, input.masterId],
      );
      if (!current[0]) throw new StoreError('not_found', 'Master version not found');
      if (current[0].status !== 'draft') {
        throw new StoreError('invalid', 'Only a draft can be published');
      }
      throw new StoreError(
        'conflict',
        'The master draft changed in another session',
        Number(current[0].revision),
      );
    }
    const master = await this.getAdminMaster(input.actorId, input.masterId);
    if (!master) throw new Error('Failed to publish master');
    return master;
  }

  async recordAsset(input: RecordAssetInput): Promise<StudioAsset> {
    const access = await requireAccess(input.ownerId, input.deckId);
    if (access.role === 'viewer') throw new StoreError('forbidden', 'Viewer access is read-only');
    const rows = await query(
      `INSERT INTO assets(
         id, owner_id, deck_id, blob_url, pathname, content_type, width, height, size
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        input.id,
        input.ownerId,
        input.deckId,
        input.blobUrl,
        input.pathname,
        input.contentType,
        input.width,
        input.height,
        input.size,
      ],
    );
    const row = rows[0];
    if (!row) throw new Error('Failed to record asset');
    return mapAsset(row);
  }
}
