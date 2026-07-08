-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 23_ai_tutor_rag.sql
-- =============================================================================
-- Real AI Tutor RAG pipeline (OpenAI gpt-5-mini + text-embedding-3-small).
--
-- knowledge_documents previously had nowhere to store the actual extracted
-- text of an uploaded document -- only a file_url reference and an embedding
-- column. You cannot do retrieval-augmented generation without the retrieved
-- text itself to paste into the prompt, so `content` is added here.
--
-- Access model: authenticated users get NO direct table privileges on
-- knowledge_documents at all. Writes happen only from the ai-tutor-chat Edge
-- Function using the service role (which bypasses RLS -- it's the trusted
-- backend). Reads happen only through match_documents(), a SECURITY DEFINER
-- function scoped to the caller's own profile_id, mirroring the pattern
-- already used for get_review_questions() in 21_exam_review_security.sql.

ALTER TABLE knowledge_documents ADD COLUMN content TEXT;

CREATE INDEX idx_knowledge_documents_embedding
  ON knowledge_documents USING hnsw (embedding vector_cosine_ops);

REVOKE ALL ON knowledge_documents FROM authenticated;

CREATE OR REPLACE FUNCTION public.match_documents(
    p_query_embedding VECTOR(768),
    p_match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT kd.id, kd.title, kd.content, 1 - (kd.embedding <=> p_query_embedding) AS similarity
    FROM knowledge_documents kd
    WHERE kd.profile_id = auth.uid()
      AND kd.embedding IS NOT NULL
    ORDER BY kd.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_documents(VECTOR(768), INT) TO authenticated;
