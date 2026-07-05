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
  return await supabase.auth.resetPasswordForEmail(email);
}
