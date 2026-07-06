-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 18_achievements.sql
--
-- Backs the /accomplishments page with real data:
--   1. achievements had zero RLS (wide open to every client role) - lock it
--      down to each user's own rows, same pattern as progress/bookmarks.
--   2. A unique (profile_id, title) constraint so awarding a badge is a safe
--      "insert if not already earned" upsert - earned_at is only ever set
--      the first time a badge's conditions are met.
--   3. get_my_rank(): a SECURITY DEFINER function so the Accomplishments page
--      can show a real leaderboard rank (by total XP) without giving any
--      client-side role direct read access to other users' progress rows.
--
-- Safe to re-run: every step is idempotent.
-- =============================================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own achievements" ON achievements;
CREATE POLICY "Users manage own achievements"
ON achievements
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_profile_id_title_key;
ALTER TABLE achievements ADD CONSTRAINT achievements_profile_id_title_key UNIQUE (profile_id, title);

CREATE OR REPLACE FUNCTION public.get_my_rank()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    WITH xp_totals AS (
        SELECT p.id AS profile_id,
               COALESCE(COUNT(pr.id) FILTER (WHERE pr.completed), 0) * 50 AS xp
        FROM profiles p
        LEFT JOIN progress pr ON pr.profile_id = p.id
        GROUP BY p.id
    ),
    ranked AS (
        SELECT profile_id, RANK() OVER (ORDER BY xp DESC) AS rnk
        FROM xp_totals
    )
    SELECT rnk FROM ranked WHERE profile_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_rank() TO authenticated;
