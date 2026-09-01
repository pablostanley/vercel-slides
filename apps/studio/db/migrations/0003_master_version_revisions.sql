ALTER TABLE master_slide_versions
  ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0);

ALTER TABLE master_slides
  DROP CONSTRAINT IF EXISTS master_slides_library_id_position_key;

ALTER TABLE master_slides
  ADD CONSTRAINT master_slides_library_id_position_key
  UNIQUE (library_id, position) DEFERRABLE INITIALLY DEFERRED;
