-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 15_triggers.sql
-- =============================================================================

-- Function to automatically create a learner profile after signup

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

    RETURN NEW;
END;
$$;

-- Trigger executed whenever a new authenticated user is created

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();