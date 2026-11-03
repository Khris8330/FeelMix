import { supabase } from './supabase';

export type StoryItem = {
  id: string;
  author_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
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

export async function fetchActiveStories(): Promise<StoryItem[]> {
  const { data: auth } = await supabase.auth.getUser();
  const myId = auth.user?.id || null;

  const { data, error } = await supabase
    .from('stories')
    .select(
      `
      id, author_id, media_url, media_type, caption, expires_at, created_at,
      profiles!stories_author_id_fkey ( id, handle, display_name, avatar_url )
    `
    )
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('fetchActiveStories', error?.message);
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

  // One story bubble per author (latest)
  const byAuthor = new Map<string, StoryItem>();
  for (const row of data) {
    const author = (row as any).profiles || {};
    if (byAuthor.has(row.author_id)) continue;
    byAuthor.set(row.author_id, {
      id: row.id,
      author_id: row.author_id,
      media_url: row.media_url,
      media_type: row.media_type,
      caption: row.caption,
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
    });
  }

  const list = Array.from(byAuthor.values());
  list.sort((a, b) => {
    if (a.is_own && !b.is_own) return -1;
    if (!a.is_own && b.is_own) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return list;
}

export async function createStory(mediaUrl: string, caption?: string) {
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
