-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 13_row_level_security.sql
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can manage their own profile"
ON profiles
FOR ALL
USING (auth.uid() = id);

-- Study Plans
CREATE POLICY "Users manage own study plans"
ON study_plans
FOR ALL
USING (auth.uid() = profile_id);

-- Study Tasks
CREATE POLICY "Users manage own study tasks"
ON study_tasks
FOR ALL
USING (
    study_plan_id IN (
        SELECT id
        FROM study_plans
        WHERE profile_id = auth.uid()
    )
);