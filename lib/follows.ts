import { supabase } from './supabase';

export type Person = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_following: boolean;
};

export async function fetchFollowing(): Promise<Person[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      following_id,
      profiles!follows_following_id_fkey (
        id, handle, display_name, avatar_url, bio
      )
    `
    )
    .eq('follower_id', auth.user.id);

  if (error || !data) {
    console.warn('fetchFollowing', error?.message);
    return [];
  }

  return data
    .map((row: any) => {
      const p = row.profiles;
      if (!p) return null;
      return {
        id: p.id,
        handle: p.handle,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        is_following: true,
      } as Person;
    })
    .filter(Boolean) as Person[];
}

export async function fetchFollowers(): Promise<Person[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      follower_id,
      profiles!follows_follower_id_fkey (
        id, handle, display_name, avatar_url, bio
      )
    `
    )
    .eq('following_id', auth.user.id);

  if (error || !data) {
    console.warn('fetchFollowers', error?.message);
    return [];
  }

  const followingIds = new Set(await getFollowingIds());

  return data
    .map((row: any) => {
      const p = row.profiles;
      if (!p) return null;
      return {
        id: p.id,
        handle: p.handle,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        bio: p.bio,
        is_following: followingIds.has(p.id),
      } as Person;
    })
    .filter(Boolean) as Person[];
}

export async function fetchSuggested(limit = 20): Promise<Person[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const following = await fetchFollowing();
  const exclude = new Set(following.map((p) => p.id));
  exclude.add(auth.user.id);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url, bio')
    .order('created_at', { ascending: false })
    .limit(limit + exclude.size);

  if (error || !data) return [];

  return data
    .filter((p) => !exclude.has(p.id))
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      handle: p.handle,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      bio: p.bio,
      is_following: false,
    }));
}

export async function followUser(userId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };
  if (auth.user.id === userId) return { error: new Error('Cannot follow yourself') };

  const { error } = await supabase.from('follows').insert({
    follower_id: auth.user.id,
    following_id: userId,
  });
  return { error };
}

export async function unfollowUser(userId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', auth.user.id)
    .eq('following_id', userId);
  return { error };
}

export async function getFollowingIds(): Promise<string[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', auth.user.id);

  return (data || []).map((r) => r.following_id);
}

export async function isFollowing(userId: string): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', auth.user.id)
    .eq('following_id', userId)
    .maybeSingle();

  return !!data;
}
