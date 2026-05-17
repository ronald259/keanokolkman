CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL CHECK (category IN ('films','animaties','fotos','projecten')),
  media_type      TEXT NOT NULL CHECK (media_type IN ('video','image')),
  file_path       TEXT NOT NULL,
  thumbnail_path  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_category_published
  ON media(category) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_media_featured_published
  ON media(featured) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_media_created
  ON media(created_at DESC);
