-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 32_draft_scope_and_grants_fix.sql
--
-- Three defensive fixes from the 2026-07-09 backend audit:
--
-- 1. save_attempt_draft() accepted ANY question_id, not just questions on the
--    attempt's own paper. All questions are readable by students, so a student
--    calling the RPC directly could attach answers for OTHER papers' questions
--    to their attempt; ai-grade-attempt then summed those marks into the
--    attempt's score (its total only counts the paper's own questions), letting
--    a percentage exceed 100%. Now every question_id is checked against the
--    attempt's paper and the call errors out on any foreign question.
--
-- 2. Explicitly re-revoke student column access to questions.marking_scheme /
--    ai_explanation. Already revoked by 21_exam_review_security.sql, but only
--    lexicographic file ordering guarantees that ran AFTER
--    20_examinations_extensions.sql re-granted them. Re-asserting here makes
--    the final state correct regardless of apply order of the 18-21 files.
--
-- 3. topic_flashcards had no explicit table grants -- it worked only via the
--    ALTER DEFAULT PRIVILEGES set up in 17_grants.sql, the same fragile
--    assumption that already bit this project once (28_service_role_grants_fix).
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
    SELECT id, profile_id, paper_id, status INTO v_attempt
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
        -- Only questions belonging to this attempt's own paper may be drafted.
        -- Without this, marks for foreign questions could be injected into the
        -- attempt and inflate the AI-graded score past 100%.
        IF NOT EXISTS (
            SELECT 1 FROM questions q
            WHERE q.id = v_key::UUID AND q.paper_id = v_attempt.paper_id
        ) THEN
            RAISE EXCEPTION 'Question % does not belong to this attempt''s paper', v_key;
        END IF;

        INSERT INTO student_answers (attempt_id, question_id, answer)
        VALUES (p_attempt_id, v_key::UUID, v_value)
        ON CONFLICT (attempt_id, question_id)
        DO UPDATE SET answer = EXCLUDED.answer;
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION save_attempt_draft(UUID, JSONB) TO authenticated;

-- (2) Re-assert the answer-column lockdown regardless of 18-21 apply order:
-- wipe whatever SELECT state earlier files left and re-grant only the safe
-- column list (same pattern as 21_exam_review_security.sql).
REVOKE SELECT ON questions FROM authenticated;
GRANT SELECT (id, paper_id, topic_id, question_text, question_type, option_a, option_b, option_c, option_d, marks)
  ON questions TO authenticated;

-- (3) Explicit grants for topic_flashcards (RLS policies already exist).
GRANT SELECT ON topic_flashcards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON topic_flashcards TO service_role;
