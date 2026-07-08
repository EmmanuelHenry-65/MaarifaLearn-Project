-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 20_notes_pinning.sql
--
-- Adds a real "pinned" flag to notes so the Workspace Notes tab's pin toggle
-- persists instead of being local-only state.
--
-- Safe to re-run.
-- =============================================================================

ALTER TABLE notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
