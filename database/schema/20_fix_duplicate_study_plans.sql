-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 20_fix_duplicate_study_plans.sql
--
-- getOrCreateDefaultPlan() used a plain select-then-insert with no database
-- guarantee behind it. When it got called twice in close succession (e.g. an
-- auth state change firing a useEffect twice with a fresh `user` object
-- reference for the same logical user), both calls could pass the "does a
-- plan exist yet?" check before either INSERT committed, creating two
-- "My Study Plan" rows for the same person. Every affected user then had
-- their tasks split across two plans - the app only ever reads from one of
-- them (the oldest), so tasks landing on the other plan looked like they'd
-- vanished, or like new tasks silently failed to appear.
--
-- This migration:
--   1. Moves every task onto its owner's oldest plan (the one the app
--      already treats as canonical).
--   2. Deletes the now-empty duplicate plans.
--   3. Adds a UNIQUE constraint on profile_id so this can never recur - the
--      application code was updated to upsert against this constraint.
--
-- Safe to re-run: steps 1-2 are no-ops once there's nothing left to merge,
-- and the constraint uses IF NOT EXISTS-equivalent guarding via a DO block.
-- =============================================================================

WITH canonical_plans AS (
    SELECT DISTINCT ON (profile_id) id AS canonical_id, profile_id
    FROM study_plans
    ORDER BY profile_id, created_at ASC
)
UPDATE study_tasks st
SET study_plan_id = cp.canonical_id
FROM study_plans sp
JOIN canonical_plans cp ON cp.profile_id = sp.profile_id
WHERE st.study_plan_id = sp.id
  AND sp.id <> cp.canonical_id;

WITH canonical_plans AS (
    SELECT DISTINCT ON (profile_id) id AS canonical_id, profile_id
    FROM study_plans
    ORDER BY profile_id, created_at ASC
)
DELETE FROM study_plans sp
USING canonical_plans cp
WHERE sp.profile_id = cp.profile_id
  AND sp.id <> cp.canonical_id;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'study_plans_profile_id_key'
    ) THEN
        ALTER TABLE study_plans ADD CONSTRAINT study_plans_profile_id_key UNIQUE (profile_id);
    END IF;
END $$;
