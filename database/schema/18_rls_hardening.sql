-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 18_rls_hardening.sql
--
-- Closes two categories of RLS gap found in a security audit:
--
--   A. Tables with RLS enabled (in 13_row_level_security.sql) but NO policy
--      ever written for them: user_preferences, conversations, messages,
--      exam_attempts, student_answers, notes, knowledge_documents.
--      RLS-enabled + zero policies = deny-all, so these are currently
--      unusable by any client role (not a leak, but broken).
--
--   B. Tables that never had RLS enabled at all: resources, ai_flashcards,
--      ai_quizzes, past_papers, questions, notifications, achievements.
--      Combined with the blanket GRANT in 17_grants.sql, these are
--      currently readable/writable by ANY authenticated user, including
--      other students' exam history, notifications, and achievements.
--
--   Also revokes SELECT on questions.correct_answer specifically, since
--   that column is the exam answer key and must never reach the client
--   even though the rest of the question needs to be readable to render
--   an exam.
--
-- Safe to re-run: every step is idempotent (DROP POLICY IF EXISTS / GRANT
-- and REVOKE are both idempotent by nature).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Policies for tables where RLS was enabled but nothing was ever granted
-- -----------------------------------------------------------------------------

-- User Preferences (one row per profile)
DROP POLICY IF EXISTS "Users manage own preferences" ON user_preferences;
CREATE POLICY "Users manage own preferences"
ON user_preferences
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Conversations (AI tutor chat sessions)
DROP POLICY IF EXISTS "Users manage own conversations" ON conversations;
CREATE POLICY "Users manage own conversations"
ON conversations
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Messages (no profile_id column directly; scoped via parent conversation)
DROP POLICY IF EXISTS "Users manage messages in own conversations" ON messages;
CREATE POLICY "Users manage messages in own conversations"
ON messages
FOR ALL
USING (
    conversation_id IN (
        SELECT id FROM conversations WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    conversation_id IN (
        SELECT id FROM conversations WHERE profile_id = auth.uid()
    )
);

-- Exam Attempts
DROP POLICY IF EXISTS "Users manage own exam attempts" ON exam_attempts;
CREATE POLICY "Users manage own exam attempts"
ON exam_attempts
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Student Answers (no profile_id column directly; scoped via parent attempt)
DROP POLICY IF EXISTS "Users manage answers in own attempts" ON student_answers;
CREATE POLICY "Users manage answers in own attempts"
ON student_answers
FOR ALL
USING (
    attempt_id IN (
        SELECT id FROM exam_attempts WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    attempt_id IN (
        SELECT id FROM exam_attempts WHERE profile_id = auth.uid()
    )
);

-- Notes
DROP POLICY IF EXISTS "Users manage own notes" ON notes;
CREATE POLICY "Users manage own notes"
ON notes
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Knowledge Documents (shared RAG corpus: everyone can read for AI tutor
-- retrieval; profile_id is nullable for admin/global docs, so only the
-- uploader can manage the ones they personally added)
DROP POLICY IF EXISTS "Authenticated users can read knowledge documents" ON knowledge_documents;
CREATE POLICY "Authenticated users can read knowledge documents"
ON knowledge_documents FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users manage their own uploaded documents" ON knowledge_documents;
CREATE POLICY "Users manage their own uploaded documents"
ON knowledge_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users update their own uploaded documents" ON knowledge_documents;
CREATE POLICY "Users update their own uploaded documents"
ON knowledge_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users delete their own uploaded documents" ON knowledge_documents;
CREATE POLICY "Users delete their own uploaded documents"
ON knowledge_documents
FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- B. Tables that never had RLS enabled at all
-- -----------------------------------------------------------------------------

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Resources: shared curriculum content, same pattern as subjects/lessons/topics
DROP POLICY IF EXISTS "Authenticated users can read resources" ON resources;
CREATE POLICY "Authenticated users can read resources"
ON resources FOR SELECT
TO authenticated
USING (true);

-- AI Flashcards: personal, AI-generated study aids
DROP POLICY IF EXISTS "Users manage own flashcards" ON ai_flashcards;
CREATE POLICY "Users manage own flashcards"
ON ai_flashcards
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- AI Quizzes: personal, AI-generated quizzes
DROP POLICY IF EXISTS "Users manage own ai quizzes" ON ai_quizzes;
CREATE POLICY "Users manage own ai quizzes"
ON ai_quizzes
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Past Papers: shared exam library, read-only for students
DROP POLICY IF EXISTS "Authenticated users can read past papers" ON past_papers;
CREATE POLICY "Authenticated users can read past papers"
ON past_papers FOR SELECT
TO authenticated
USING (true);

-- Questions: shared exam content, read-only for students at the row level.
-- correct_answer is additionally locked down at the COLUMN level below,
-- since RLS alone can't hide one column while exposing the rest of the row.
DROP POLICY IF EXISTS "Authenticated users can read questions" ON questions;
CREATE POLICY "Authenticated users can read questions"
ON questions FOR SELECT
TO authenticated
USING (true);

-- Notifications: personal, system/app-generated alerts
DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
CREATE POLICY "Users manage own notifications"
ON notifications
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- Achievements: personal earned badges
DROP POLICY IF EXISTS "Users manage own achievements" ON achievements;
CREATE POLICY "Users manage own achievements"
ON achievements
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- C. Column-level protection: never let the exam answer key reach a client,
--    even though the rest of the question row is legitimately readable.
-- -----------------------------------------------------------------------------

REVOKE SELECT ON questions FROM authenticated;

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
    marks
) ON questions TO authenticated;
