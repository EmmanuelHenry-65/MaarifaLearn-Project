-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 02_database_enums.sql
-- =============================================================================
--
-- Common ENUM types used throughout the database.
--
-- =============================================================================

-- Study Plans
CREATE TYPE study_plan_status AS ENUM (
    'active',
    'paused',
    'completed'
);

CREATE TYPE task_priority AS ENUM (
    'low',
    'medium',
    'high'
);

-- Learning
CREATE TYPE difficulty_level AS ENUM (
    'easy',
    'medium',
    'hard'
);

CREATE TYPE resource_type AS ENUM (
    'pdf',
    'video',
    'audio',
    'image',
    'link'
);

-- AI
CREATE TYPE ai_model AS ENUM (
    'gemini',
    'gpt',
    'claude'
);

-- Exams
CREATE TYPE exam_status AS ENUM (
    'in_progress',
    'submitted',
    'graded'
);

CREATE TYPE paper_type AS ENUM (
    'assignment',
    'midterm',
    'endterm',
    'mock',
    'kcse'
);

CREATE TYPE question_type AS ENUM (
    'multiple_choice',
    'short_answer',
    'essay',
    'true_false'
);

-- Notifications
CREATE TYPE notification_type AS ENUM (
    'system',
    'exam',
    'planner',
    'achievement',
    'ai'
);