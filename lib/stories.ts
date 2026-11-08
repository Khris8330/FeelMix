import { supabase } from './supabase';
import type { MoodMixResult } from './mood';

export type StoryItem = {
  id: string;
  author_id: string;
  media_url: string | null;
  media_type: string;
  caption: string | null;
  bg_color: string | null;
  vibe_json: Record<string, any> | null;
  expires_at: string;
  created_at: string;
  author: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
  seen: boolean;
  is_own: boolean;
};

/** One ring in the rail: an author + all their active stories (oldest → newest). */
export type StoryRing = {
  author_id: string;
  author: StoryItem['author'];
  is_own: boolean;
  /** true only if every story has been seen */
  all_seen: boolean;
  stories: StoryItem[];
  /** Prefer first unseen, else first */
  open_id: string;
};

function mapRow(row: any, myId: string | null, seen: Set<string>): StoryItem {
  const author = row.profiles || {};
  return {
    id: row.id,
    author_id: row.author_id,
    media_url: row.media_url,
    media_type: row.media_type || 'image',
    caption: row.caption,
    bg_color: row.bg_color,
    vibe_json: row.vibe_json,
    expires_at: row.expires_at,
    created_at: row.created_at,
    author: {
      id: author.id,
      handle: author.handle,
      display_name: author.display_name,
      avatar_url: author.avatar_url,
    },
    seen: seen.has(row.id),
    is_own: myId === row.author_id,
  };
}

export async function fetchStoryRings(): Promise<StoryRing[]> {
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id || null;

  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      id, author_id, media_url, media_type, caption, bg_color, vibe_json, expires_at, created_at,
      profiles!stories_author_id_fkey ( id, handle, display_name, avatar_url )
    `
    )
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.warn('fetchStoryRings', error?.message);
    return [];
  }

  const storyIds = data.map((s) => s.id);
  const seen = new Set<string>();
  if (myId && storyIds.length) {
    const { data: views } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', myId)
      .in('story_id', storyIds);
    (views || []).forEach((v) => seen.add(v.story_id));
  }

  const byAuthor = new Map<string, StoryItem[]>();
  for (const row of data) {
    const item = mapRow(row, myId, seen);
    const list = byAuthor.get(row.author_id) || [];
    list.push(item);
    byAuthor.set(row.author_id, list);
  }

  const rings: StoryRing[] = [];
  for (const [author_id, stories] of byAuthor) {
    const firstUnseen = stories.find((s) => !s.seen);
    rings.push({
      author_id,
      author: stories[0].author,
      is_own: stories[0].is_own,
      all_seen: stories.every((s) => s.seen),
      stories,
      open_id: (firstUnseen || stories[0]).id,
    });
  }

  rings.sort((a, b) => {
    if (a.is_own && !b.is_own) return -1;
    if (!a.is_own && b.is_own) return 1;
    if (a.all_seen !== b.all_seen) return a.all_seen ? 1 : -1;
    const aLatest = a.stories[a.stories.length - 1]?.created_at || '';
    const bLatest = b.stories[b.stories.length - 1]?.created_at || '';
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  return rings;
}

/** @deprecated prefer fetchStoryRings */
export async function fetchActiveStories(): Promise<StoryItem[]> {
  const rings = await fetchStoryRings();
  return rings.map((r) => r.stories[r.stories.length - 1]);
}

export async function fetchStoriesByAuthor(authorId: string): Promise<StoryItem[]> {
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id || null;

  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      id, author_id, media_url, media_type, caption, bg_color, vibe_json, expires_at, created_at,
      profiles!stories_author_id_fkey ( id, handle, display_name, avatar_url )
    `
    )
    .eq('author_id', authorId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const storyIds = data.map((s) => s.id);
  const seen = new Set<string>();
  if (myId && storyIds.length) {
    const { data: views } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', myId)
      .in('story_id', storyIds);
    (views || []).forEach((v) => seen.add(v.story_id));
  }

  return data.map((row) => mapRow(row, myId, seen));
}

export async function createImageStory(mediaUrl: string, caption?: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), story: null };

  const { data, error } = await supabase
    .from('stories')
    .insert({
      author_id: auth.user.id,
      media_url: mediaUrl,
      media_type: 'image',
      caption: caption || null,
    })
    .select('id')
    .single();

  return { error, story: data };
}

export async function createStory(mediaUrl: string, caption?: string) {
  return createImageStory(mediaUrl, caption);
}

export async function createTextStory(text: string, bgColor: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), story: null };

  const { data, error } = await supabase
    .from('stories')
    .insert({
      author_id: auth.user.id,
      media_url: null,
      media_type: 'text',
      caption: text.trim(),
      bg_color: bgColor,
    })
    .select('id')
    .single();

  return { error, story: data };
}

export async function createVibeStory(vibe: MoodMixResult, note?: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), story: null };

  const caption =
    note?.trim() ||
    `${vibe.moodTitle} · ${vibe.trackName} · ${vibe.movieTitle}`;

  const { data, error } = await supabase
    .from('stories')
    .insert({
      author_id: auth.user.id,
      media_url: vibe.coverUrl || null,
      media_type: 'vibe',
      caption,
      bg_color: '#1a1020',
      vibe_json: {
        moodTitle: vibe.moodTitle,
        moodSubtitle: vibe.moodSubtitle,
        trackName: vibe.trackName,
        trackArtist: vibe.trackArtist,
        movieTitle: vibe.movieTitle,
        movieYear: vibe.movieYear,
        movieDirector: vibe.movieDirector,
        coverUrl: vibe.coverUrl,
        insight: vibe.insight,
      },
    })
    .select('id')
    .single();

  return { error, story: data };
}

export async function markStoryViewed(storyId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from('story_views').upsert({
    story_id: storyId,
    viewer_id: auth.user.id,
  });
}

export async function uploadStoryImage(file: {
  uri: string;
  type?: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), url: null };

  const mime = file.type || 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const path = `${auth.user.id}/stories/${Date.now()}.${ext}`;

  const res = await fetch(file.uri);
  const body = await res.blob();

  const { error: upErr } = await supabase.storage.from('media').upload(path, body, {
    upsert: false,
    contentType: mime,
  });
  if (upErr) return { error: upErr, url: null };

  const { data: pub } = supabase.storage.from('media').getPublicUrl(path);
  return { error: null, url: pub.publicUrl };
}
