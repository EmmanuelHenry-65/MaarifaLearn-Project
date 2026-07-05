-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 07_ai_tutor.sql
-- =============================================================================

-- Conversations
CREATE TABLE conversations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    title TEXT,

    ai_model ai_model DEFAULT 'gemini',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    sender TEXT NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Flashcards
CREATE TABLE ai_flashcards (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    topic_id UUID
        REFERENCES topics(id)
        ON DELETE SET NULL,

    question TEXT NOT NULL,

    answer TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Quizzes
CREATE TABLE ai_quizzes (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    topic_id UUID
        REFERENCES topics(id)
        ON DELETE SET NULL,

    title TEXT NOT NULL,

    difficulty difficulty_level DEFAULT 'medium',

    created_at TIMESTAMPTZ DEFAULT NOW()
);