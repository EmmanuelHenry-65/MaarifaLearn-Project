-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 14_storage.sql
-- =============================================================================

INSERT INTO storage.buckets
(id, name, public)

VALUES
('avatars', 'avatars', true)

ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets
(id, name, public)

VALUES
('documents', 'documents', false)

ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets
(id, name, public)

VALUES
('resources', 'resources', true)

ON CONFLICT (id) DO NOTHING;