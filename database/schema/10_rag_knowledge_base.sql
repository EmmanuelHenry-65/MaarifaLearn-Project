-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 10_rag_knowledge_base.sql
-- =============================================================================

CREATE TABLE knowledge_documents (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    title TEXT NOT NULL,

    file_name TEXT,

    file_url TEXT NOT NULL,

    file_type TEXT,

    embedding VECTOR(768),

    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);