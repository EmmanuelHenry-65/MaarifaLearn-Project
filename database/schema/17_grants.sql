-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 17_grants.sql
--
-- Fixes "permission denied for table X" (Postgres error 42501) errors on
-- every table, including ones untouched by other migrations (e.g. profiles).
--
-- RLS policies only filter which ROWS a role can see/touch once it already
-- has permission to run the underlying SELECT/INSERT/UPDATE/DELETE on the
-- table. That base table-level permission is a separate, coarser grant that
-- Supabase normally configures automatically — this project's tables don't
-- have it, so every authenticated request is rejected before RLS is ever
-- evaluated.
--
-- Run this once. It also sets default privileges so tables created by
-- future migrations get the same access automatically.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
