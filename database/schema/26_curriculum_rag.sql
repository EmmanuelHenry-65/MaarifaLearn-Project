-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 26_curriculum_rag.sql
--
-- Extends the RAG knowledge base (10_rag_knowledge_base.sql, 23_ai_tutor_rag.sql)
-- to also hold embedded OFFICIAL CURRICULUM content (topic explanations + worked
-- examples, now that all 72 topics have real content) alongside each student's
-- own personal uploads. Curriculum rows use profile_id = NULL to mark them as
-- shared/global, readable by every learner via match_documents() -- distinct
-- from a student's personal uploads, which stay scoped to profile_id = auth.uid().
-- =============================================================================

ALTER TABLE knowledge_documents ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE knowledge_documents ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;
ALTER TABLE knowledge_documents ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;

CREATE INDEX idx_knowledge_documents_topic_id ON knowledge_documents(topic_id);

-- match_documents() now searches BOTH the caller's own uploads (profile_id = auth.uid())
-- AND the shared curriculum base (profile_id IS NULL), flagging which source each
-- match came from so the Edge Function never misattributes curriculum text as the
-- student's own uploaded material. The return shape is changing (new is_curriculum
-- column), which Postgres doesn't allow via CREATE OR REPLACE, so drop first.
DROP FUNCTION IF EXISTS public.match_documents(VECTOR(768), INT);

CREATE FUNCTION public.match_documents(
    p_query_embedding VECTOR(768),
    p_match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    similarity FLOAT,
    is_curriculum BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT kd.id, kd.title, kd.content, 1 - (kd.embedding <=> p_query_embedding) AS similarity, (kd.profile_id IS NULL) AS is_curriculum
    FROM knowledge_documents kd
    WHERE (kd.profile_id = auth.uid() OR kd.profile_id IS NULL)
      AND kd.embedding IS NOT NULL
    ORDER BY kd.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_documents(VECTOR(768), INT) TO authenticated;
