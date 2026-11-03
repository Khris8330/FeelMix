import { supabase } from './supabase';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function isAuthed(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, displayName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        full_name: displayName,
      },
      emailRedirectTo: 'https://feel-mix.vercel.app',
    },
  });
}

export async function verifyEmailOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });
}

export async function resendSignupOtp(email: string) {
  return supabase.auth.resend({
    type: 'signup',
    email,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
