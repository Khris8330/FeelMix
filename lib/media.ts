import { supabase } from './supabase';

export async function uploadPostImage(file: {
  uri: string;
  type?: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), url: null };

  const mime = file.type || 'image/jpeg';
  const ext = mime.includes('png')
    ? 'png'
    : mime.includes('webp')
      ? 'webp'
      : 'jpg';
  const path = `${auth.user.id}/posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

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

export async function uploadManyPostImages(
  files: { uri: string; type?: string }[]
): Promise<{ urls: string[]; error: Error | null }> {
  const urls: string[] = [];
  for (const file of files) {
    const { error, url } = await uploadPostImage(file);
    if (error || !url) return { urls, error: error || new Error('Upload failed') };
    urls.push(url);
  }
  return { urls, error: null };
}
