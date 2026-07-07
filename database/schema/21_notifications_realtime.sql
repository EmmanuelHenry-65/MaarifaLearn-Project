-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 21_notifications_realtime.sql
--
-- The notification bell only ever fetched unread count once when the top
-- nav mounted. A notification created later in the same session (e.g. a
-- study reminder, a newly-earned badge) never updated the badge until a
-- full page reload. Enabling Realtime on this one table lets the client
-- subscribe to INSERTs and update the count the instant a new notification
-- lands, scoped to just this table rather than every table in the project.
--
-- Safe to re-run: adding an already-added table to a publication is a no-op
-- (guarded below rather than erroring).
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;
