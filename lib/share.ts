import { Platform, Share } from 'react-native';
import { showToast } from './toast';

export type SharePayload = {
  title?: string;
  message?: string;
  url: string;
};

function postUrl(postId: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/post/${postId}`;
  }
  return `https://feel-mix.vercel.app/post/${postId}`;
}

export function buildPostShare(postId: string, body?: string | null): SharePayload {
  const url = postUrl(postId);
  const snippet = (body || '').trim().slice(0, 140);
  return {
    title: 'Krimie',
    message: snippet ? `${snippet}${snippet.length >= 140 ? '…' : ''}\n\n${url}` : url,
    url,
  };
}

export function buildVibeShare(
  postId: string,
  vibe?: { mood_title?: string; track_name?: string; track_artist?: string } | null
): SharePayload {
  const url = postUrl(postId);
  const mood = vibe?.mood_title || 'My vibe';
  const track =
    vibe?.track_name && vibe?.track_artist
      ? `${vibe.track_name} by ${vibe.track_artist}`
      : null;
  const message = track ? `${mood} · ${track}\n\n${url}` : `${mood}\n\n${url}`;
  return { title: 'Krimie · Mood Mix', message, url };
}

/** Native share sheet when available, otherwise copy link. */
export async function shareContent(payload: SharePayload): Promise<'shared' | 'copied' | 'cancelled'> {
  const { title, message, url } = payload;

  // Web Web Share API
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
      clipboard?: { writeText: (t: string) => Promise<void> };
    };
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title, text: message, url });
        return 'shared';
      } catch (e: any) {
        if (e?.name === 'AbortError') return 'cancelled';
      }
    }
    if (nav.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(url);
        showToast('Link copied');
        return 'copied';
      } catch {
        // fall through
      }
    }
  }

  // React Native Share
  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? { title, url, message: message || url }
        : { title, message: message || url }
    );
    if (result.action === Share.sharedAction) return 'shared';
    if (result.action === Share.dismissedAction) return 'cancelled';
  } catch {
    // fall through to copy attempt messaging
  }

  showToast('Share', url);
  return 'copied';
}

export async function sharePost(postId: string, body?: string | null) {
  return shareContent(buildPostShare(postId, body));
}

export async function shareVibePost(
  postId: string,
  vibe?: { mood_title?: string; track_name?: string; track_artist?: string } | null
) {
  return shareContent(buildVibeShare(postId, vibe));
}
