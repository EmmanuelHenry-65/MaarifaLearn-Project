-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 12_indexes.sql
-- =============================================================================

CREATE INDEX idx_lessons_subject
ON lessons(subject_id);

CREATE INDEX idx_topics_lesson
ON topics(lesson_id);

CREATE INDEX idx_resources_topic
ON resources(topic_id);

CREATE INDEX idx_studyplans_profile
ON study_plans(profile_id);

CREATE INDEX idx_tasks_plan
ON study_tasks(study_plan_id);

CREATE INDEX idx_messages_conversation
ON messages(conversation_id);

CREATE INDEX idx_attempts_profile
ON exam_attempts(profile_id);

CREATE INDEX idx_progress_profile
ON progress(profile_id);

CREATE INDEX idx_documents_profile
ON knowledge_documents(profile_id);