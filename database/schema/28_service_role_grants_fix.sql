-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 28_service_role_grants_fix.sql
--
-- Fixes a database-wide gap found in a full audit: a REVOKE ALL was run
-- against every table at some point, and only `authenticated` ever got its
-- grants re-added (see 17_grants.sql). `service_role` -- the key every Edge
-- Function uses -- has had ZERO SELECT/INSERT/UPDATE/DELETE on 21 of 24
-- tables (the exam_submissions/past_papers partial patch in
-- 27_exam_submissions_grants.sql was a symptom of this, not the whole fix).
-- Any Edge Function using service_role to read/write those tables fails
-- silently (permission denied, easily mistaken for "no rows returned").
--
-- Granting full table access to service_role here is safe: service_role
-- already bypasses RLS entirely by definition (that's what makes it the
-- trusted backend key), so this doesn't change WHO can see what -- it only
-- lets the already-fully-trusted key actually function as intended.
--
-- Also fixes a second, separate gap: `knowledge_documents` has RLS policies
-- scoped to `authenticated` but ZERO table-level grant for `authenticated`
-- at all. RLS is evaluated only after the base table-level grant already
-- allows the operation, so those policies have been unreachable -- direct
-- client access to that table has been fully broken (the RAG chat only
-- worked because match_documents() runs as table owner via SECURITY
-- DEFINER, bypassing this gap entirely). This grant is filtered by the
-- already-existing, already-correct RLS policies on that table.
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_documents TO authenticated;
