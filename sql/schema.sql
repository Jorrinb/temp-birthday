-- Maria's Birthday Bucket List — Database Schema
-- Run this against your Neon database before starting the app.

CREATE TABLE IF NOT EXISTS players (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_activity_status (
  id           SERIAL PRIMARY KEY,
  player_id    INT NOT NULL REFERENCES players(id)    ON DELETE CASCADE,
  activity_id  INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(player_id, activity_id)
);
