-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 19_study_planner_extensions.sql
--
-- The Study Planner UI was built against mock data. To make it real, study_tasks
-- needs a few fields the original schema didn't have: a subject/type label for
-- display and grouping, and a time-of-day window so tasks can render as a daily
-- schedule instead of just a due date.
-- =============================================================================

ALTER TABLE study_tasks
    ADD COLUMN IF NOT EXISTS subject TEXT,
    ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'task',
    ADD COLUMN IF NOT EXISTS start_time TIME,
    ADD COLUMN IF NOT EXISTS end_time TIME;

ALTER TABLE study_tasks
    DROP CONSTRAINT IF EXISTS study_tasks_task_type_check;

ALTER TABLE study_tasks
    ADD CONSTRAINT study_tasks_task_type_check
    CHECK (task_type IN ('lesson', 'practice', 'task', 'past_paper', 'revision'));

CREATE INDEX IF NOT EXISTS idx_study_tasks_due_date ON study_tasks(due_date);
