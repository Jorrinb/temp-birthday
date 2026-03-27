-- Maria's Birthday Bucket List — Seed Data
-- Run this AFTER schema.sql to populate default activities.
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING if you add a unique constraint,
-- or just run once on a fresh database.

INSERT INTO activities (title, description, category, sort_order) VALUES
  ('Buy Maria a birthday shot',          'Get the birthday girl a drink! 🥂',           'Club',        1),
  ('Get everyone on the dance floor',    'No wallflowers allowed 💃🕺',                 'Club',        2),
  ('Get the DJ to play a birthday song', 'Make some noise for Maria 🎶',                'Club',        3),
  ('Sing a dramatic duet at karaoke',    'Full commitment, no shame 🎤',                'Karaoke',     4),
  ('Dedicate a song to Maria',           'Serenade the birthday queen 👑',              'Karaoke',     5),
  ('Record one chaotic karaoke performance', 'For the archives 📹',                     'Karaoke',     6),
  ('Toast before midnight',              'Glasses up, everyone 🥂',                     'Core Memory', 7),
  ('Take a Polaroid-style group pic',    'Preserve the chaos forever 📸',               'Core Memory', 8),
  ('Take a group bathroom mirror selfie','Essential party ritual 🪞',                   'Funny',       9),
  ('Make Maria laugh until she snorts',  'You know the assignment 😂',                  'Funny',       10);
