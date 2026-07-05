-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 04_user_preferences.sql
-- =============================================================================

CREATE TABLE user_preferences (

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL UNIQUE
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    theme TEXT DEFAULT 'dark',

    language TEXT DEFAULT 'English',

    notifications_enabled BOOLEAN DEFAULT TRUE,

    preferred_ai_model ai_model DEFAULT 'gemini',

    daily_study_goal INTEGER DEFAULT 60,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);