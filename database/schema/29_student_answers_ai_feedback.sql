-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 29_student_answers_ai_feedback.sql
--
-- Short-answer/essay questions were never graded: submit_exam_attempt() only
-- auto-grades multiple_choice/true_false, leaving short_answer/essay rows at
-- marks_awarded = 0, is_correct = NULL forever (ResultsDashboard's "Pending
-- Review" card promised this would resolve via Smart Review, but nothing
-- ever produced a resolution). This adds a place to store the AI grader's
-- per-answer feedback, written by the new ai-grade-attempt Edge Function
-- (service_role only, same access pattern as exam_attempts/student_answers
-- generally -- students still cannot write this column themselves).
-- =============================================================================

ALTER TABLE student_answers ADD COLUMN ai_feedback TEXT;
