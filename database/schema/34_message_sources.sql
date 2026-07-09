-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 34_message_sources.sql
--
-- The AI Tutor's answers are grounded via RAG (retrieval against the vector
-- database), but which real document actually fed a given answer was never
-- shown to the student -- ai-tutor-chat now returns a `sources` list
-- alongside `answer`, and this column lets the frontend persist and display
-- it under each assistant message ("Sourced from: ...") instead of only
-- having it for the current session before a reload.
-- =============================================================================

ALTER TABLE messages ADD COLUMN sources JSONB;
