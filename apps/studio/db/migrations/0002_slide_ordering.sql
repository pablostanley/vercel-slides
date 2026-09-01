ALTER TABLE deck_slides
  DROP CONSTRAINT IF EXISTS deck_slides_deck_id_position_key;

ALTER TABLE deck_slides
  ADD CONSTRAINT deck_slides_deck_id_position_key
  UNIQUE (deck_id, position) DEFERRABLE INITIALLY DEFERRED;

INSERT INTO studio_migrations(version) VALUES ('0002_slide_ordering')
ON CONFLICT (version) DO NOTHING;
