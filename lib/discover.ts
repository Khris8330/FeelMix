import { supabase } from './supabase';
import {
  fetchFeedPosts,
  type FeedPost,
} from './posts';
import { getFollowingIds } from './follows';

export type DiscoverPerson = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  is_following: boolean;
};

function trendingScore(post: FeedPost): number {
  const engagement =
    (post.likes_count || 0) * 1 +
    (post.comments_count || 0) * 2 +
    (post.reposts_count || 0) * 3 +
    (post.shares_count || 0) * 1.5 +
    (post.vibe ? 2 : 0);

  const ageHours = Math.max(
    0,
    (Date.now() - new Date(post.created_at).getTime()) / 3_600_000
  );
  // Newer posts rank higher; engagement still wins
  return engagement / Math.pow(ageHours + 2, 1.15);
}

/** Rank posts by engagement + freshness (not just vibes). */
export async function fetchTrendingPosts(limit = 20): Promise<FeedPost[]> {
  // Pull a wider pool, then rank client-side (RLS still applies)
  const pool = await fetchFeedPosts(Math.max(limit * 4, 60));
  return [...pool]
    .sort((a, b) => trendingScore(b) - trendingScore(a))
    .slice(0, limit);
}

export async function fetchTrendingVibes(limit = 12): Promise<FeedPost[]> {
  const trending = await fetchTrendingPosts(40);
  return trending.filter((p) => p.vibe).slice(0, limit);
}

/** People you do not already follow, ordered by follower count. */
export async function fetchSuggestedPeople(limit = 12): Promise<DiscoverPerson[]> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id;
  const following = me ? await getFollowingIds() : [];
  const exclude = new Set(following);
  if (me) exclude.add(me);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, display_name, avatar_url, bio, followers_count')
    .order('followers_count', { ascending: false })
    .limit(40);

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
      followers_count: p.followers_count || 0,
      is_following: false,
    }));
}
