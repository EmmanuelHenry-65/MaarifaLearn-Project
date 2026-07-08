-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 30_exam_attempt_drafts.sql
--
-- Exam answers were only ever written to student_answers at final submission
-- (via submit_exam_attempt()) -- closing the tab mid-exam lost everything,
-- despite Past Papers' "Continue Practice" label implying resumability.
-- Direct client INSERT/UPDATE on student_answers stays revoked (same as
-- submit_exam_attempt() requires), so this adds a second, narrower
-- SECURITY DEFINER RPC just for periodic autosave: it only ever touches the
-- `answer` column, never grades anything or changes exam_attempts.status,
-- and does nothing once the attempt is no longer 'in_progress'.
-- =============================================================================

CREATE OR REPLACE FUNCTION save_attempt_draft(p_attempt_id UUID, p_answers JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt RECORD;
    v_key TEXT;
    v_value TEXT;
BEGIN
    SELECT id, profile_id, status INTO v_attempt
    FROM exam_attempts
    WHERE id = p_attempt_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attempt not found';
    END IF;

    IF v_attempt.profile_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized to save answers for this attempt';
    END IF;

    -- Already submitted/graded -- ignore a stale autosave call rather than error.
    IF v_attempt.status != 'in_progress' THEN
        RETURN;
    END IF;

    FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_answers)
    LOOP
        INSERT INTO student_answers (attempt_id, question_id, answer)
        VALUES (p_attempt_id, v_key::UUID, v_value)
        ON CONFLICT (attempt_id, question_id)
        DO UPDATE SET answer = EXCLUDED.answer;
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION save_attempt_draft(UUID, JSONB) TO authenticated;
