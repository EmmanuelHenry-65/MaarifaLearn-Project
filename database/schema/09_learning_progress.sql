-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 09_learning_progress.sql
-- =============================================================================

-- Progress
CREATE TABLE progress (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    topic_id UUID NOT NULL
        REFERENCES topics(id)
        ON DELETE CASCADE,

    completed BOOLEAN DEFAULT FALSE,

    mastery_score DECIMAL DEFAULT 0,

    last_accessed_at TIMESTAMPTZ,

    UNIQUE(profile_id, topic_id)
);

-- Notes
CREATE TABLE notes (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    topic_id UUID
        REFERENCES topics(id)
        ON DELETE SET NULL,

    title TEXT,

    content TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE bookmarks (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    resource_id UUID NOT NULL
        REFERENCES resources(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(profile_id, resource_id)
);