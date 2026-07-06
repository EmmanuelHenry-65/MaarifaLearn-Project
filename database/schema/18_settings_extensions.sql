-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 18_settings_extensions.sql
--
-- Adds the columns and policies needed by the Settings page:
--   - profiles: username, curriculum, learning_pathway
--   - user_preferences: study reminders, quiz hints, default learning view
--   - keeps profiles.email in sync when a user confirms an email change
--   - provisions a user_preferences row automatically on signup
--   - storage RLS so a user can manage their own avatar file
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles: new account information fields used by the Settings page
-- -----------------------------------------------------------------------------

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS username CITEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS curriculum TEXT,
    ADD COLUMN IF NOT EXISTS learning_pathway TEXT;

-- -----------------------------------------------------------------------------
-- 2. user_preferences: additional preference fields used by the Settings page
--    (theme/language/notifications_enabled already existed in 04_user_preferences.sql)
-- -----------------------------------------------------------------------------

ALTER TABLE user_preferences
    ADD COLUMN IF NOT EXISTS study_reminders_enabled BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS quiz_hints_enabled BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS default_learning_view TEXT DEFAULT 'detailed';

-- Recreate the check constraint idempotently so this file can be re-run safely.
ALTER TABLE user_preferences
    DROP CONSTRAINT IF EXISTS user_preferences_default_learning_view_check;

ALTER TABLE user_preferences
    ADD CONSTRAINT user_preferences_default_learning_view_check
    CHECK (default_learning_view IN ('detailed', 'compact'));

-- -----------------------------------------------------------------------------
-- 3. Provision a matching user_preferences row whenever a profile is created,
--    so every account has defaults to load on first login (no null-state UI).
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    );

    INSERT INTO public.user_preferences (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. supabase.auth.updateUser({ email }) only changes auth.users.email once the
--    confirmation link is clicked. This trigger mirrors that change into
--    profiles.email so the rest of the app (which reads from profiles) stays
--    in sync automatically.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_user_email_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.handle_user_email_updated();

-- -----------------------------------------------------------------------------
-- 5. Storage RLS: a user may only write inside their own "<user_id>/" folder
--    in the "avatars" bucket, but anyone can read (the bucket is public so
--    avatar URLs can be rendered directly in <img> tags).
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
