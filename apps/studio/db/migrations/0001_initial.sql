CREATE TABLE IF NOT EXISTS studio_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  username text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS template_libraries (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS decks (
  id text PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id),
  title text NOT NULL,
  template_library_id text REFERENCES template_libraries(id),
  theme_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'link')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deck_members (
  deck_id text NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('viewer', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deck_id, user_id)
);

CREATE TABLE IF NOT EXISTS deck_invites (
  deck_id text NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('viewer', 'editor')),
  invited_by text NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deck_id, email)
);

CREATE TABLE IF NOT EXISTS deck_slides (
  id text PRIMARY KEY,
  deck_id text NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  master_slide_id text,
  master_version_id text,
  schema_version integer NOT NULL,
  document_json jsonb NOT NULL,
  notes text NOT NULL DEFAULT '',
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deck_id, position)
);

CREATE TABLE IF NOT EXISTS master_slides (
  id text PRIMARY KEY,
  library_id text NOT NULL REFERENCES template_libraries(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL CHECK (position >= 0),
  current_published_version_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (library_id, slug),
  UNIQUE (library_id, position)
);

CREATE TABLE IF NOT EXISTS master_slide_versions (
  id text PRIMARY KEY,
  master_slide_id text NOT NULL REFERENCES master_slides(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  schema_version integer NOT NULL,
  document_json jsonb NOT NULL,
  thumbnail_json jsonb,
  created_by text NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE (master_slide_id, version)
);

ALTER TABLE master_slides
  DROP CONSTRAINT IF EXISTS master_slides_current_published_version_id_fkey;
ALTER TABLE master_slides
  ADD CONSTRAINT master_slides_current_published_version_id_fkey
  FOREIGN KEY (current_published_version_id) REFERENCES master_slide_versions(id);

ALTER TABLE deck_slides
  DROP CONSTRAINT IF EXISTS deck_slides_master_slide_id_fkey;
ALTER TABLE deck_slides
  ADD CONSTRAINT deck_slides_master_slide_id_fkey
  FOREIGN KEY (master_slide_id) REFERENCES master_slides(id);

ALTER TABLE deck_slides
  DROP CONSTRAINT IF EXISTS deck_slides_master_version_id_fkey;
ALTER TABLE deck_slides
  ADD CONSTRAINT deck_slides_master_version_id_fkey
  FOREIGN KEY (master_version_id) REFERENCES master_slide_versions(id);

CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id),
  deck_id text REFERENCES decks(id) ON DELETE CASCADE,
  blob_url text NOT NULL,
  pathname text NOT NULL UNIQUE,
  content_type text NOT NULL,
  width integer,
  height integer,
  size bigint NOT NULL CHECK (size >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deck_revisions (
  deck_id text NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  operation text NOT NULL,
  actor_id text NOT NULL REFERENCES users(id),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deck_id, revision)
);

CREATE TABLE IF NOT EXISTS seed_markers (
  key text PRIMARY KEY,
  version text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decks_owner_updated_idx ON decks(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS deck_members_user_idx ON deck_members(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS deck_slides_deck_position_idx ON deck_slides(deck_id, position);
CREATE INDEX IF NOT EXISTS master_slides_library_position_idx ON master_slides(library_id, position);
CREATE INDEX IF NOT EXISTS master_versions_master_created_idx
  ON master_slide_versions(master_slide_id, created_at DESC);
CREATE INDEX IF NOT EXISTS assets_owner_deck_idx ON assets(owner_id, deck_id, created_at DESC);

INSERT INTO studio_migrations(version) VALUES ('0001_initial')
ON CONFLICT (version) DO NOTHING;
