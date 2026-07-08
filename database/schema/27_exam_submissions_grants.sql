-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 27_exam_submissions_grants.sql
--
-- Fixes silent failures in the new AI-marking Edge Function (ai-mark-exam):
-- service_role had no SELECT/UPDATE grant on exam_submissions and no SELECT
-- grant on past_papers -- only leftover default privileges (TRIGGER/TRUNCATE/
-- REFERENCES). Same class of gap noted earlier in this project: a REVOKE ALL
-- strips service_role too, and grants only ever got re-added for
-- `authenticated`, never for `service_role`. Without this, the Edge Function's
-- reads/writes fail silently (no thrown error), so it always falls back to
-- "no marking scheme available" and never persists a result.
-- =============================================================================

GRANT SELECT, UPDATE ON exam_submissions TO service_role;
GRANT SELECT ON past_papers TO service_role;
