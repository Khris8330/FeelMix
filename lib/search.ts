import { supabase } from './supabase';
import { getFollowingIds } from './follows';

export type SearchPerson = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_following: boolean;
};

export type SearchPost = {
  id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export async function searchPeople(query: string, limit = 20): Promise<SearchPerson[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id || null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url, bio')
    .or(`handle.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(limit);

  if (error || !data) {
    console.warn('searchPeople', error?.message);
    return [];
  }

  const following = new Set(await getFollowingIds());

  return data
    .filter((p) => p.id !== myId)
    .map((p) => ({
      id: p.id,
      handle: p.handle,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      bio: p.bio,
      is_following: following.has(p.id),
    }));
}

export async function searchPosts(query: string, limit = 20): Promise<SearchPost[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id, body, created_at,
      profiles!posts_author_id_fkey ( id, handle, display_name, avatar_url )
    `
    )
    .is('deleted_at', null)
    .ilike('body', `%${q}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.warn('searchPosts', error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    author: {
      id: row.profiles?.id,
      handle: row.profiles?.handle,
      display_name: row.profiles?.display_name,
      avatar_url: row.profiles?.avatar_url,
    },
  }));
}
