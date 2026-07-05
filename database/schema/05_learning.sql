-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 05_learning.sql
-- =============================================================================

-- Subjects
CREATE TABLE subjects (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL UNIQUE,

    code TEXT UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    subject_id UUID NOT NULL
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    lesson_order INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics
CREATE TABLE topics (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    lesson_id UUID NOT NULL
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    difficulty difficulty_level DEFAULT 'medium',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Resources
CREATE TABLE resources (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    topic_id UUID NOT NULL
        REFERENCES topics(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    resource_type resource_type NOT NULL,

    url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);