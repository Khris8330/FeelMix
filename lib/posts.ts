import { supabase } from './supabase';

export type FeedAuthor = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  status_emoji: string | null;
};

export type FeedVibe = {
  mood_title: string;
  mood_subtitle: string | null;
  track_name: string;
  track_artist: string;
  movie_title: string;
  movie_year: string | null;
  movie_director: string | null;
  cover_url: string | null;
};

export type FeedPost = {
  id: string;
  body: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  shares_count: number;
  created_at: string;
  author: FeedAuthor;
  vibe: FeedVibe | null;
  liked_by_me: boolean;
  reposted_by_me: boolean;
};

function mapRow(row: any, likedIds: Set<string>, repostIds: Set<string>): FeedPost {
  const author = row.profiles || row.author || {};
  const vibeRow = Array.isArray(row.vibes) ? row.vibes[0] : row.vibes;
  return {
    id: row.id,
    body: row.body,
    image_url: row.image_url,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0,
    reposts_count: row.reposts_count ?? 0,
    shares_count: row.shares_count ?? 0,
    created_at: row.created_at,
    author: {
      id: author.id,
      handle: author.handle,
      display_name: author.display_name,
      avatar_url: author.avatar_url,
      is_verified: !!author.is_verified,
      status_emoji: author.status_emoji,
    },
    vibe: vibeRow
      ? {
          mood_title: vibeRow.mood_title,
          mood_subtitle: vibeRow.mood_subtitle,
          track_name: vibeRow.track_name,
          track_artist: vibeRow.track_artist,
          movie_title: vibeRow.movie_title,
          movie_year: vibeRow.movie_year,
          movie_director: vibeRow.movie_director,
          cover_url: vibeRow.cover_url,
        }
      : null,
    liked_by_me: likedIds.has(row.id),
    reposted_by_me: repostIds.has(row.id),
  };
}

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

async function engagementSets(postIds: string[]) {
  const liked = new Set<string>();
  const reposted = new Set<string>();
  if (!postIds.length) return { liked, reposted };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { liked, reposted };

  const [{ data: likes }, { data: reposts }] = await Promise.all([
    supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', auth.user.id)
      .in('post_id', postIds),
    supabase
      .from('reposts')
      .select('post_id')
      .eq('user_id', auth.user.id)
      .in('post_id', postIds),
  ]);

  (likes || []).forEach((r) => liked.add(r.post_id));
  (reposts || []).forEach((r) => reposted.add(r.post_id));
  return { liked, reposted };
}

export async function fetchFeedPosts(limit = 40): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id, body, image_url, likes_count, comments_count, reposts_count, shares_count, created_at,
      profiles!posts_author_id_fkey ( id, handle, display_name, avatar_url, is_verified, status_emoji ),
      vibes ( mood_title, mood_subtitle, track_name, track_artist, movie_title, movie_year, movie_director, cover_url )
    `
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.warn('fetchFeedPosts', error?.message);
    return [];
  }

  const ids = data.map((r) => r.id);
  const { liked, reposted } = await engagementSets(ids);
  return data.map((r) => mapRow(r, liked, reposted));
}

export async function fetchPostsByAuthor(authorId: string): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
      id, body, image_url, likes_count, comments_count, reposts_count, shares_count, created_at,
      profiles!posts_author_id_fkey ( id, handle, display_name, avatar_url, is_verified, status_emoji ),
      vibes ( mood_title, mood_subtitle, track_name, track_artist, movie_title, movie_year, movie_director, cover_url )
    `
    )
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  const ids = data.map((r) => r.id);
  const { liked, reposted } = await engagementSets(ids);
  return data.map((r) => mapRow(r, liked, reposted));
}

export async function createPost(body: string, imageUrl?: string | null) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), post: null };

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: auth.user.id,
      body: body.trim(),
      image_url: imageUrl || null,
      visibility: 'public',
    })
    .select('id')
    .single();

  return { error, post: data };
}

export async function toggleLike(postId: string, currentlyLiked: boolean) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  if (currentlyLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('post_id', postId);
    return { error };
  }
  const { error } = await supabase.from('likes').insert({
    user_id: auth.user.id,
    post_id: postId,
  });
  return { error };
}

export async function toggleRepost(postId: string, currentlyReposted: boolean) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  if (currentlyReposted) {
    const { error } = await supabase
      .from('reposts')
      .delete()
      .eq('user_id', auth.user.id)
      .eq('post_id', postId);
    return { error };
  }
  const { error } = await supabase.from('reposts').insert({
    user_id: auth.user.id,
    post_id: postId,
  });
  return { error };
}
