-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 19_ai_tutor_attachments.sql
--
-- Backs the AI Tutor "Upload & Ask" button with real file storage:
--   1. Let a message carry an optional file attachment (notes/PDF/image).
--   2. Add storage.objects policies for the 'documents' bucket (it existed
--      since 14_storage.sql but had zero policies, so uploads/downloads
--      were impossible - RLS on storage.objects is deny-by-default just
--      like any other table).
--
-- Files are stored under documents/<user_id>/<filename> so a user can only
-- reach their own folder.
--
-- Safe to re-run: every step is idempotent.
-- =============================================================================

-- attachment_path stores the storage object path (not a URL) - the bucket is
-- private, so a fresh signed URL is generated on read rather than storing one
-- that would eventually expire.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_path TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;

DROP POLICY IF EXISTS "Users upload documents to their own folder" ON storage.objects;
CREATE POLICY "Users upload documents to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users read their own documents" ON storage.objects;
CREATE POLICY "Users read their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users delete their own documents" ON storage.objects;
CREATE POLICY "Users delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
