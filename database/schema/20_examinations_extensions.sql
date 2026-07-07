-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 20_examinations_extensions.sql
--
-- Wires the Past Papers / Exam Center pages to real data instead of the
-- static src/data/examData.ts mock:
--
--   1. subjects: add icon + color_key so the frontend can style subject
--      chips by joining on a stable key instead of hardcoding subject
--      names. Backfills the 9 rows seeded by 16_my_learning_dynamic.sql.
--   2. past_papers: add duration_minutes, difficulty, term -- fields the
--      mock displayed that the original schema never modeled.
--   3. questions: add marking_scheme, ai_explanation -- used by the "AI
--      walkthrough" panel, previously only existed as static mock strings.
--   4. bookmarks: extend again (same pattern as step 3 of
--      16_my_learning_dynamic.sql) so a bookmark can target a past_paper,
--      not just a resource or topic.
--   5. submit_exam_attempt(): a SECURITY DEFINER RPC that grades an attempt
--      server-side. Required because questions.correct_answer is revoked
--      from `authenticated` (18_rls_hardening.sql) -- only a definer
--      function can read it to grade. Also revokes direct client UPDATE on
--      exam_attempts and INSERT/UPDATE on student_answers, so a student
--      can't just PATCH their own score via the API -- all attempt-scoring
--      writes must go through this function instead.
--
-- Safe to re-run: every step is idempotent (IF NOT EXISTS / DROP ... IF
-- EXISTS / CREATE OR REPLACE).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Subjects: visual metadata (icon + a stable style key)
-- -----------------------------------------------------------------------------

ALTER TABLE subjects ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS color_key TEXT;

UPDATE subjects AS s SET
    icon = v.icon,
    color_key = v.color_key
FROM (VALUES
    ('mathematics', '⨍', 'mathematics'),
    ('english', '📖', 'english'),
    ('kiswahili', '🗣️', 'kiswahili'),
    ('ict', '💻', 'ict'),
    ('pe', '🏃', 'pe'),
    ('csl', '🤝', 'csl'),
    ('physics', '⚛️', 'physics'),
    ('chemistry', '🧪', 'chemistry'),
    ('computer-studies', '🖥️', 'computer-studies')
) AS v(code, icon, color_key)
WHERE s.code = v.code;

-- -----------------------------------------------------------------------------
-- 2. Past papers: fields the mock had that the schema didn't
-- -----------------------------------------------------------------------------

ALTER TABLE past_papers ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE past_papers ADD COLUMN IF NOT EXISTS difficulty difficulty_level DEFAULT 'medium';
ALTER TABLE past_papers ADD COLUMN IF NOT EXISTS term TEXT;

-- Exact-match slug so the seed script (database/seeds/seed_data.sql) can be
-- re-run without duplicating rows, same pattern as lessons.slug/topics.slug
-- in 16_my_learning_dynamic.sql.
ALTER TABLE past_papers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- -----------------------------------------------------------------------------
-- 3. Questions: marking scheme + AI walkthrough content
-- -----------------------------------------------------------------------------

ALTER TABLE questions ADD COLUMN IF NOT EXISTS marking_scheme TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_explanation TEXT;

-- Column-level grants (18_rls_hardening.sql) allow only a fixed column list
-- through to `authenticated`. Extend that list so the two new columns are
-- actually readable -- otherwise they'd silently come back NULL to clients.
GRANT SELECT (
    id,
    paper_id,
    topic_id,
    question_text,
    question_type,
    option_a,
    option_b,
    option_c,
    option_d,
    marks,
    marking_scheme,
    ai_explanation
) ON questions TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Bookmarks: allow targeting a past_paper as well as a resource/topic
-- -----------------------------------------------------------------------------

ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS paper_id UUID REFERENCES past_papers(id) ON DELETE CASCADE;

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_target_check;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_target_check
    CHECK (
        (resource_id IS NOT NULL)::int +
        (topic_id IS NOT NULL)::int +
        (paper_id IS NOT NULL)::int = 1
    );

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_profile_id_paper_id_key;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_profile_id_paper_id_key UNIQUE (profile_id, paper_id);

-- The existing "Users manage own bookmarks" policy (16_my_learning_dynamic.sql)
-- only checks profile_id, so it already covers paper_id rows -- no new policy
-- needed here.

-- -----------------------------------------------------------------------------
-- 5. Server-side grading: RPC + lock down direct client writes to attempts
-- -----------------------------------------------------------------------------

-- Students may INSERT (start an attempt) and SELECT (view their own history)
-- directly, but must never be able to UPDATE score/percentage/grade/status
-- themselves -- that would let anyone self-grade. All scoring writes happen
-- inside submit_exam_attempt() below, which runs as the (trusted) function
-- owner rather than the calling client role.
REVOKE UPDATE ON exam_attempts FROM authenticated;

-- Likewise, students never write student_answers directly -- the grading
-- function does it for them after checking the correct_answer they can't see.
REVOKE INSERT, UPDATE ON student_answers FROM authenticated;

CREATE OR REPLACE FUNCTION submit_exam_attempt(p_attempt_id UUID, p_answers JSONB)
RETURNS TABLE (score DECIMAL, percentage DECIMAL, grade TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_paper_id UUID;
    v_total_marks DECIMAL;
    v_earned_marks DECIMAL := 0;
    v_percentage DECIMAL;
    v_grade TEXT;
    v_answer RECORD;
    v_question RECORD;
    v_is_correct BOOLEAN;
    v_marks_awarded DECIMAL;
BEGIN
    SELECT profile_id, paper_id INTO v_profile_id, v_paper_id
    FROM exam_attempts WHERE id = p_attempt_id;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found';
    END IF;

    IF v_profile_id <> auth.uid() THEN
        RAISE EXCEPTION 'Not authorized to submit this attempt';
    END IF;

    FOR v_answer IN
        SELECT key AS question_id, value AS answer_text FROM jsonb_each_text(p_answers)
    LOOP
        SELECT id, question_type, correct_answer, marks INTO v_question
        FROM questions WHERE id = v_answer.question_id::UUID AND paper_id = v_paper_id;

        IF v_question.id IS NULL THEN
            CONTINUE;
        END IF;

        IF v_question.question_type IN ('multiple_choice', 'true_false') THEN
            -- Auto-gradable: compare directly to the answer key.
            v_is_correct := lower(trim(v_question.correct_answer)) = lower(trim(v_answer.answer_text));
            v_marks_awarded := CASE WHEN v_is_correct THEN v_question.marks ELSE 0 END;
        ELSE
            -- short_answer / essay: not auto-gradable here. Recorded as
            -- pending (marks_awarded = 0, is_correct = NULL) until a future
            -- manual or AI-assisted grading pass reviews it.
            v_is_correct := NULL;
            v_marks_awarded := 0;
        END IF;

        INSERT INTO student_answers (attempt_id, question_id, answer, marks_awarded, is_correct)
        VALUES (p_attempt_id, v_question.id, v_answer.answer_text, v_marks_awarded, v_is_correct)
        ON CONFLICT (attempt_id, question_id)
        DO UPDATE SET
            answer = EXCLUDED.answer,
            marks_awarded = EXCLUDED.marks_awarded,
            is_correct = EXCLUDED.is_correct;

        v_earned_marks := v_earned_marks + v_marks_awarded;
    END LOOP;

    SELECT COALESCE(SUM(marks), 0) INTO v_total_marks FROM questions WHERE paper_id = v_paper_id;

    v_percentage := CASE WHEN v_total_marks > 0 THEN ROUND((v_earned_marks / v_total_marks) * 100, 1) ELSE 0 END;
    v_grade := CASE
        WHEN v_percentage >= 80 THEN 'A'
        WHEN v_percentage >= 70 THEN 'B'
        WHEN v_percentage >= 60 THEN 'C'
        WHEN v_percentage >= 50 THEN 'D'
        ELSE 'E'
    END;

    UPDATE exam_attempts
    SET score = v_earned_marks,
        percentage = v_percentage,
        grade = v_grade,
        status = 'submitted',
        submitted_at = NOW()
    WHERE id = p_attempt_id;

    RETURN QUERY SELECT v_earned_marks, v_percentage, v_grade;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_exam_attempt(UUID, JSONB) TO authenticated;
