-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 25_topic_flashcards.sql
--
-- Shared curriculum flashcards, one set per topic, visible to every learner.
-- Distinct from `ai_flashcards`, which is personal AI-generated content
-- scoped to a single profile_id via RLS (auth.uid() = profile_id) -- that
-- table cannot hold content meant to be seen by all students.
-- =============================================================================

CREATE TABLE topic_flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    card_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topic_flashcards_topic_id ON topic_flashcards(topic_id);

ALTER TABLE topic_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read topic flashcards"
ON topic_flashcards FOR SELECT
TO authenticated
USING (true);
