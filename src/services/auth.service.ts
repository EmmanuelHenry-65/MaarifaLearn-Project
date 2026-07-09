import { supabase } from "../lib/supabase";

export async function login(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signup(
  fullName: string,
  email: string,
  password: string,
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function forgotPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({ password: newPassword });
}

/**
 * Redirects to Google's sign-in page, then back to /dashboard. Requires the
 * Google provider to be enabled in the Supabase dashboard (Authentication ->
 * Providers -> Google) with a real Client ID/Secret from Google Cloud
 * Console -- this call fails with a clear Supabase error until that's done.
 */
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
}
