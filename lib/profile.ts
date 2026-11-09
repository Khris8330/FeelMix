import { supabase } from './supabase';
import { isFollowing } from './follows';

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

export type PublicProfile = Profile & {
  is_following: boolean;
  is_own: boolean;
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

export async function fetchProfileById(userId: string): Promise<PublicProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id || null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, handle, display_name, avatar_url, bio, status_emoji, is_verified, posts_count, followers_count, following_count, vibes_count'
    )
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  const following = myId && myId !== userId ? await isFollowing(userId) : false;

  return {
    ...(data as Profile),
    is_following: following,
    is_own: myId === userId,
  };
}

export async function updateMyProfile(patch: {
  display_name?: string;
  bio?: string | null;
  handle?: string;
  avatar_url?: string | null;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', auth.user.id)
    .select(
      'id, handle, display_name, avatar_url, bio, status_emoji, is_verified, posts_count, followers_count, following_count, vibes_count'
    )
    .single();

  return { data: data as Profile | null, error };
}

/** Upload avatar image (File on web, or { uri, type, name } on native). */
export async function uploadAvatar(file: {
  uri: string;
  type?: string;
  name?: string;
  blob?: Blob;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), url: null };

  const userId = auth.user.id;
  const mime = file.type || 'image/jpeg';
  const ext = mime.includes('png')
    ? 'png'
    : mime.includes('webp')
      ? 'webp'
      : mime.includes('gif')
        ? 'gif'
        : 'jpg';
  const path = `${userId}/avatar.${ext}`;

  let body: Blob | ArrayBuffer;
  if (file.blob) {
    body = file.blob;
  } else if (file.uri.startsWith('blob:') || file.uri.startsWith('data:')) {
    const res = await fetch(file.uri);
    body = await res.blob();
  } else {
    const res = await fetch(file.uri);
    body = await res.blob();
  }

  const { error: upErr } = await supabase.storage.from('avatars').upload(path, body, {
    upsert: true,
    contentType: mime,
  });

  if (upErr) return { error: upErr, url: null };

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${pub.publicUrl}?t=${Date.now()}`;

  const { error: dbErr } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', userId);

  if (dbErr) return { error: dbErr, url: null };
  return { error: null, url };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
