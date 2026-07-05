-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 03_profiles.sql
-- =============================================================================

CREATE TABLE profiles (

    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT NOT NULL,

    email CITEXT UNIQUE NOT NULL,

    school TEXT,

    grade TEXT,

    admission_number TEXT UNIQUE,

    avatar_url TEXT,

    onboarding_completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);