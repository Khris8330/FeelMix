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
  const path = `${auth.user.id}/posts/${Date.now()}.${ext}`;

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
