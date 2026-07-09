-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 33_resources_subject_level.sql
--
-- resources.topic_id was NOT NULL, so every resource had to belong to exactly
-- one topic. The 19 curriculum notes/pamphlets PDFs added to the repo cover a
-- whole subject each, not a single topic, so they had nowhere to attach. This
-- makes topic_id optional and adds subject_id for subject-wide resources --
-- a resource can have either, both, or (rarely) neither; the app treats a
-- missing subject label as "General" rather than requiring one.
-- =============================================================================

ALTER TABLE resources ALTER COLUMN topic_id DROP NOT NULL;
ALTER TABLE resources ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE;

CREATE INDEX idx_resources_subject_id ON resources(subject_id);
