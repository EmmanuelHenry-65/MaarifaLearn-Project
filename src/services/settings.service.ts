// Data-access layer for the Settings page. Components never talk to Supabase
// directly — they call these functions, which map DB rows (snake_case) to
// camelCase objects and translate Postgres errors into messages safe to show
// in the UI.
import { supabase } from '../lib/supabase';

export interface ProfileSettings {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  grade: string | null;
  curriculum: string | null;
  learningPathway: string | null;
  avatarUrl: string | null;
}

export interface PreferenceSettings {
  theme: 'light' | 'dark';
  studyRemindersEnabled: boolean;
  quizHintsEnabled: boolean;
  defaultLearningView: 'detailed' | 'compact';
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  grade: string | null;
  curriculum: string | null;
  learning_pathway: string | null;
  avatar_url: string | null;
}

interface PreferenceRow {
  theme: string;
  study_reminders_enabled: boolean;
  quiz_hints_enabled: boolean;
  default_learning_view: string;
}

// Used the first time a user opens Settings, before a user_preferences row
// exists for them (falls back gracefully instead of showing a blank screen).
const DEFAULT_PREFERENCES: PreferenceSettings = {
  theme: 'dark',
  studyRemindersEnabled: true,
  quizHintsEnabled: true,
  defaultLearningView: 'detailed',
};

function mapProfileRow(row: ProfileRow): ProfileSettings {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    username: row.username,
    grade: row.grade,
    curriculum: row.curriculum,
    learningPathway: row.learning_pathway,
    avatarUrl: row.avatar_url,
  };
}

function mapPreferenceRow(row: PreferenceRow): PreferenceSettings {
  return {
    theme: row.theme === 'light' ? 'light' : 'dark',
    studyRemindersEnabled: row.study_reminders_enabled,
    quizHintsEnabled: row.quiz_hints_enabled,
    defaultLearningView: row.default_learning_view === 'compact' ? 'compact' : 'detailed',
  };
}

/** Message is always safe to render directly to the user. */
export class SettingsError extends Error {}

function toUserMessage(error: { code?: string; message: string }, fallback: string): SettingsError {
  // Postgres unique_violation on the username column.
  if (error.code === '23505') {
    return new SettingsError('That username is already taken.');
  }
  return new SettingsError(error.message || fallback);
}

export async function getProfileSettings(userId: string): Promise<ProfileSettings> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, username, grade, curriculum, learning_pathway, avatar_url')
    .eq('id', userId)
    .single()
    .returns<ProfileRow>();

  if (error) throw toUserMessage(error, 'Could not load your account information.');
  return mapProfileRow(data);
}

export interface ProfileUpdateInput {
  fullName: string;
  username: string | null;
  grade: string | null;
  curriculum: string | null;
  learningPathway: string | null;
}

export async function updateProfileSettings(userId: string, input: ProfileUpdateInput): Promise<ProfileSettings> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName.trim(),
      username: input.username?.trim() || null,
      grade: input.grade || null,
      curriculum: input.curriculum || null,
      learning_pathway: input.learningPathway || null,
    })
    .eq('id', userId)
    .select('id, full_name, email, username, grade, curriculum, learning_pathway, avatar_url')
    .single()
    .returns<ProfileRow>();

  if (error) throw toUserMessage(error, 'Could not save your account information.');
  return mapProfileRow(data);
}

/**
 * Starts Supabase's built-in email-change flow. auth.users.email is only
 * updated once the confirmation link is clicked; a DB trigger then copies it
 * into profiles.email (see 18_settings_extensions.sql).
 */
export async function requestEmailChange(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
  if (error) throw new SettingsError(error.message);
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  // Fixed filename per user (not per upload) so re-uploading overwrites the
  // old file instead of leaking orphaned images in storage.
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  });
  if (uploadError) throw new SettingsError('Could not upload your profile picture.');

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
  // Cache-bust so the browser doesn't keep showing the previous avatar image.
  const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);
  if (updateError) throw new SettingsError('Could not save your profile picture.');

  return avatarUrl;
}

export async function removeAvatar(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId);
  if (error) throw new SettingsError('Could not remove your profile picture.');
}

/** Permanently deletes the current user's account and all owned data via the delete-account Edge Function. */
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('delete-account');
  if (error) throw new SettingsError('Could not delete your account. Please try again.');
  if (!data?.success) throw new SettingsError(data?.error ?? 'Could not delete your account. Please try again.');
}

/**
 * Security requirement: the current password must be re-verified (via a
 * fresh sign-in) before a new one is accepted — a user who leaves a session
 * unlocked can't change the password without knowing the original one.
 */
export async function changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (reauthError) throw new SettingsError('Current password is incorrect.');

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw new SettingsError(updateError.message || 'Could not update your password.');
}

export async function getPreferences(userId: string): Promise<PreferenceSettings> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('theme, study_reminders_enabled, quiz_hints_enabled, default_learning_view')
    .eq('profile_id', userId)
    .maybeSingle()
    .returns<PreferenceRow | null>();

  if (error) throw toUserMessage(error, 'Could not load your preferences.');
  return data ? mapPreferenceRow(data) : DEFAULT_PREFERENCES;
}

export async function updatePreferences(userId: string, input: PreferenceSettings): Promise<PreferenceSettings> {
  const { data, error } = await supabase
    .from('user_preferences')
    // Upsert covers the (rare) case where the row wasn't provisioned yet,
    // e.g. for accounts created before the signup trigger added it.
    .upsert(
      {
        profile_id: userId,
        theme: input.theme,
        study_reminders_enabled: input.studyRemindersEnabled,
        quiz_hints_enabled: input.quizHintsEnabled,
        default_learning_view: input.defaultLearningView,
      },
      { onConflict: 'profile_id' },
    )
    .select('theme, study_reminders_enabled, quiz_hints_enabled, default_learning_view')
    .single()
    .returns<PreferenceRow>();

  if (error) throw toUserMessage(error, 'Could not save your preferences.');
  return mapPreferenceRow(data);
}
