import { supabase } from './supabase';

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  status_emoji: string | null;
  is_verified: boolean;
  posts_count: number;
  followers_count: number;
  following_count: number;
  vibes_count: number;
};

export async function fetchMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, handle, display_name, avatar_url, bio, status_emoji, is_verified, posts_count, followers_count, following_count, vibes_count'
    )
    .eq('id', auth.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
