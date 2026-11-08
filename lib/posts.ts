import { supabase } from './supabase';
import type { VibeEmbed } from '@/data/mock';
import { getFollowingIds } from './follows';

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
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  shares_count: number;
  created_at: string;
  visibility: string;
  author_id: string;
  author: FeedAuthor;
  vibe: FeedVibe | null;
  liked_by_me: boolean;
  my_reaction: string | null;
  reposted_by_me: boolean;
};

export type CommentItem = {
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

function mapRow(
  row: any,
  likedIds: Set<string>,
  repostIds: Set<string>,
  myReactions: Map<string, string>
): FeedPost {
  const author = row.profiles || row.author || {};
  const vibeRow = Array.isArray(row.vibes) ? row.vibes[0] : row.vibes;
  const images = Array.isArray(row.post_images)
    ? [...row.post_images].sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => i.url)
    : [];
  if (!images.length && row.image_url) images.push(row.image_url);

  return {
    id: row.id,
    body: row.body,
    image_url: images[0] || row.image_url || null,
    image_urls: images,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0,
    reposts_count: row.reposts_count ?? 0,
    shares_count: row.shares_count ?? 0,
    created_at: row.created_at,
    visibility: row.visibility || 'public',
    author_id: row.author_id || author.id,
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
    liked_by_me: likedIds.has(row.id) || myReactions.has(row.id),
    my_reaction: myReactions.get(row.id) || null,
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
  const myReactions = new Map<string, string>();
  if (!postIds.length) return { liked, reposted, myReactions };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { liked, reposted, myReactions };

  const [{ data: likes }, { data: reposts }, { data: reactions }] = await Promise.all([
    supabase.from('likes').select('post_id').eq('user_id', auth.user.id).in('post_id', postIds),
    supabase.from('reposts').select('post_id').eq('user').eq('user_id', auth.user.id).in('post_id', postIds),
    supabase.from('reactions').select('post_id, type').eq('user_id', auth.user.id).in('post_id', postIds),
  ]);

  (likes || []).forEach((r) => liked.add(r.post_id));
  (reposts || []).forEach((r) => reposted.add(r.post_id));
  (reactions || []).forEach((r) => myReactions.set(r.post_id, r.type));
  return { liked, reposted, myReactions };
}

const postSelect = `
  id, body, image_url, likes_count, comments_count, reposts_count, shares_count, created_at, visibility, author_id,
  profiles!posts_author_id_fkey ( id, handle, display_name, avatar_url, is_verified, status_emoji ),
  vibes ( mood_title, mood_subtitle, track_name, track_artist, movie_title, movie_year, movie_director, cover_url ),
  post_images ( url, sort_order )
`;

export async function fetchFeedPosts(limit = 40): Promise<FeedPost[]> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id;

  let query = supabase
    .from('posts')
    .select(postSelect)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (me) {
    const followingIds = await getFollowingIds();
    if (followingIds.length > 0) {
      query = query.in('author_id', [...followingIds, me]);
    }
  }

  let { data, error } = await query;

  if ((!data || data.length === 0) && !error) {
    const fallback = await supabase
      .from('posts')
      .select(postSelect)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) {
    console.warn('fetchFeedPosts', error?.message);
    return [];
  }

  const ids = data.map((r) => r.id);
  const { liked, reposted, myReactions } = await engagementSets(ids);
  return data.map((r) => mapRow(r, liked, reposted, myReactions));
}

export async function fetchPostsByAuthor(authorId: string): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  const ids = data.map((r) => r.id);
  const { liked, reposted, myReactions } = await engagementSets(ids);
  return data.map((r) => mapRow(r, liked, reposted, myReactions));
}

export async function createPost(body: string, imageUrls?: string[] | null) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), post: null };

  const urls = (imageUrls || []).filter(Boolean);
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: auth.user.id,
      body: body.trim(),
      image_url: urls[0] || null,
      visibility: 'public',
    })
    .select('id')
    .single();

  if (error || !post) return { error: error || new Error('Post failed'), post: null };

  if (urls.length) {
    const rows = urls.map((url, i) => ({
      post_id: post.id,
      url,
      sort_order: i,
    }));
    const { error: imgErr } = await supabase.from('post_images').insert(rows);
    if (imgErr) console.warn('post_images', imgErr.message);
  }

  return { error: null, post };
}

export async function createPostWithVibe(
  body: string,
  vibe: VibeEmbed,
  lifeEventKey?: string | null
) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), post: null };

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: auth.user.id,
      body: body.trim(),
      visibility: 'public',
    })
    .select('id')
    .single();

  if (postError || !post) return { error: postError || new Error('Post failed'), post: null };

  const { error: vibeError } = await supabase.from('vibes').insert({
    post_id: post.id,
    mood_title: vibe.moodTitle,
    mood_subtitle: vibe.moodSubtitle || null,
    track_name: vibe.trackName,
    track_artist: vibe.trackArtist,
    movie_title: vibe.movieTitle,
    movie_year: vibe.movieYear || null,
    movie_director: vibe.movieDirector || null,
    cover_url: vibe.coverUrl || null,
  });

  if (vibeError) return { error: vibeError, post };

  await supabase.from('mood_sessions').insert({
    user_id: auth.user.id,
    prompt_text: body.trim(),
    life_event_key: lifeEventKey || null,
    result_track_json: { name: vibe.trackName, artist: vibe.trackArtist },
    result_movie_json: {
      title: vibe.movieTitle,
      year: vibe.movieYear,
      director: vibe.movieDirector,
    },
  });

  return { error: null, post };
}

export async function setReaction(postId: string, type: string | null) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  const uid = auth.user.id;

  await supabase.from('reactions').delete().eq('user_id', uid).eq('post_id', postId);
  await supabase.from('likes').delete().eq('user_id', uid).eq('post_id', postId);

  if (!type) return { error: null };

  const { error: rErr } = await supabase.from('reactions').upsert(
    { user_id: uid, post_id: postId, type },
    { onConflict: 'user_id,post_id' }
  );
  if (rErr) {
    console.warn('setReaction reaction', rErr.message);
    return { error: rErr };
  }

  const { error: lErr } = await supabase.from('likes').insert({
    user_id: uid,
    post_id: postId,
  });
  if (lErr && !lErr.message?.includes('duplicate')) {
    console.warn('setReaction like', lErr.message);
  }

  return { error: null };
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

export async function fetchComments(postId: string): Promise<CommentItem[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `id, body, created_at, profiles!comments_author_id_fkey ( id, handle, display_name, avatar_url )`
    )
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    author: {
      id: c.profiles?.id,
      handle: c.profiles?.handle,
      display_name: c.profiles?.display_name,
      avatar_url: c.profiles?.avatar_url,
    },
  }));
}

export async function addComment(postId: string, body: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), comment: null };

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: auth.user.id, body: body.trim() })
    .select('id')
    .single();

  return { error, comment: data };
}

export async function deletePost(postId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  const { data, error } = await supabase
    .from('posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', auth.user.id)
    .select('id');

  if (error) return { error };
  if (!data || data.length === 0) {
    return { error: new Error('Delete failed. You may not own this post.') };
  }
  return { error: null };
}

export async function updatePostBody(postId: string, body: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  const { error } = await supabase
    .from('posts')
    .update({ body: body.trim() })
    .eq('id', postId)
    .eq('author_id', auth.user.id);

  return { error };
}

export async function updatePostVisibility(
  postId: string,
  visibility: 'public' | 'followers' | 'private'
) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in') };

  const { error } = await supabase
    .from('posts')
    .update({ visibility })
    .eq('id', postId)
    .eq('author_id', auth.user.id);

  return { error };
}
