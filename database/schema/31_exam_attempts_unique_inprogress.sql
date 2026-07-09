-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 31_exam_attempts_unique_inprogress.sql
--
-- startAttempt() in the frontend was a select-then-insert with no constraint
-- behind it: a double-click on "Start Practice" fired two concurrent calls,
-- both saw "no in-progress attempt", and both inserted -- leaving the student
-- with two live attempts whose autosaved answers split unpredictably. Same
-- race the study_plans table already had fixed (19_fix_duplicate_study_plans
-- pattern). This enforces one in-progress attempt per student per paper at
-- the database level; the frontend now catches the unique violation and
-- re-selects the surviving row.
--
-- Completed attempts are untouched -- students can still attempt the same
-- paper as many times as they like, just not have two live ones at once.
-- =============================================================================

-- Consolidate any existing duplicate in-progress attempts before the index
-- can be created: keep the most recently started one per (profile, paper)
-- (it has the freshest draft answers), delete the rest. student_answers rows
-- cascade with their attempt.
DELETE FROM exam_attempts older
USING exam_attempts newer
WHERE older.profile_id = newer.profile_id
  AND older.paper_id = newer.paper_id
  AND older.status = 'in_progress'
  AND newer.status = 'in_progress'
  AND (older.started_at < newer.started_at
       OR (older.started_at = newer.started_at AND older.id < newer.id));

CREATE UNIQUE INDEX IF NOT EXISTS exam_attempts_one_in_progress
    ON exam_attempts (profile_id, paper_id)
    WHERE status = 'in_progress';
