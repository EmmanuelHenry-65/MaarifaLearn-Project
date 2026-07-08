-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 24_past_papers_marking_scheme.sql
-- =============================================================================
-- Real past-paper PDFs need a place to store the whole-paper marking scheme
-- (separate from questions.marking_scheme, which is per-question text for the
-- interactive Quick Practice mode's seeded MCQ papers). This is for the new
-- "Authentic Paper Exam" mode's real uploaded papers, which have no seeded
-- `questions` rows at all -- just a downloadable exam PDF and a marking
-- scheme PDF, the latter of which must stay admin/AI-only, never
-- student-readable (same reasoning as 21_exam_review_security.sql).
--
-- past_papers previously had a blanket table-level SELECT grant for
-- authenticated (needed so students can browse papers), which would have
-- exposed this new column too. Column-level access can't be layered on top
-- of an existing table-level grant, so the table grant is replaced with an
-- explicit column list that excludes marking_scheme_pdf_path.

ALTER TABLE past_papers ADD COLUMN marking_scheme_pdf_path TEXT;

REVOKE SELECT ON past_papers FROM authenticated;
GRANT SELECT (id, subject_id, title, year, paper_type, pdf_url, created_at, duration_minutes, difficulty, term, slug)
  ON past_papers TO authenticated;
