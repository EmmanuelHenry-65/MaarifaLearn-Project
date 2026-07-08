-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 22_exam_submissions.sql
-- =============================================================================
-- "Authentic Exam" mode: download the real paper, complete it offline, upload
-- a photo/scan of the completed answers, AI marks it. Deliberately a separate
-- table from exam_attempts (which is the existing on-screen MCQ mode's model:
-- per-question answers, auto-graded via submit_exam_attempt()) rather than
-- overloading it -- the two modes have different shapes (one file upload vs.
-- many per-question answers) and keeping them apart avoids conflating two
-- different kinds of "attempt" under one table.
--
-- File storage: reuses the existing `documents` bucket and its
-- "upload to your own folder" policies (see 14_storage.sql /
-- 19_ai_tutor_attachments.sql) -- students
-- upload to `{auth.uid()}/...`, so no new bucket or storage policy is needed.
-- `file_path` stores that storage path (not a public URL, since `documents`
-- is a private bucket); the frontend requests a signed URL to read it back.
--
-- AI marking itself is NOT implemented here -- that's a separate follow-up
-- once the AI provider is chosen (see project mentor decision). Submissions
-- sit in 'submitted' status until that pipeline exists. ai_score/ai_percentage/
-- ai_feedback/reviewed_at are only ever written by that future backend
-- process (via the service role, which bypasses RLS) -- authenticated users
-- get no UPDATE grant on this table at all.

CREATE TYPE submission_status AS ENUM ('submitted', 'ai_reviewing', 'reviewed');

CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES past_papers(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    status submission_status NOT NULL DEFAULT 'submitted',
    ai_score NUMERIC,
    ai_percentage NUMERIC,
    ai_feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_exam_submissions_profile ON exam_submissions(profile_id);
CREATE INDEX idx_exam_submissions_paper ON exam_submissions(paper_id);

ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own exam submissions"
  ON exam_submissions FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users upload their own exam submissions"
  ON exam_submissions FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Deliberately no UPDATE/DELETE policy for authenticated: once uploaded, a
-- submission can only be advanced (status/ai_score/ai_feedback) by the future
-- AI-marking backend via the service role, which bypasses RLS entirely.

REVOKE ALL ON exam_submissions FROM authenticated;
GRANT SELECT ON exam_submissions TO authenticated;
GRANT INSERT (profile_id, paper_id, file_path) ON exam_submissions TO authenticated;
