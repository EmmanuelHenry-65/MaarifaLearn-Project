-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 21_exam_review_security.sql
-- =============================================================================
-- Closes a leak: `questions.marking_scheme` and `questions.ai_explanation` had
-- SELECT granted to `authenticated`, so getPaperQuestions() (called at preview
-- and exam-start, before submission) returned them to the browser immediately
-- -- visible via dev tools while the student is still answering. `correct_answer`
-- was already correctly locked down the same way; this brings the other two
-- answer-revealing columns in line with it.
--
-- Marking scheme / AI explanation are now only obtainable via
-- get_review_questions(), which checks the caller owns a submitted/graded
-- attempt on that paper before releasing them.

REVOKE SELECT ON questions FROM authenticated;
GRANT SELECT (id, paper_id, topic_id, question_text, question_type, option_a, option_b, option_c, option_d, marks)
  ON questions TO authenticated;

CREATE OR REPLACE FUNCTION public.get_review_questions(p_attempt_id UUID)
RETURNS TABLE (
    id UUID,
    paper_id UUID,
    topic_id UUID,
    question_text TEXT,
    question_type question_type,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    marks INTEGER,
    marking_scheme TEXT,
    ai_explanation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_paper_id UUID;
BEGIN
    SELECT ea.paper_id INTO v_paper_id
    FROM exam_attempts ea
    WHERE ea.id = p_attempt_id
      AND ea.profile_id = auth.uid()
      AND ea.status IN ('submitted', 'graded');

    IF v_paper_id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found, not yours, or not submitted yet';
    END IF;

    RETURN QUERY
    SELECT q.id, q.paper_id, q.topic_id, q.question_text, q.question_type,
           q.option_a, q.option_b, q.option_c, q.option_d, q.marks,
           q.marking_scheme, q.ai_explanation
    FROM questions q
    WHERE q.paper_id = v_paper_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_questions(UUID) TO authenticated;
