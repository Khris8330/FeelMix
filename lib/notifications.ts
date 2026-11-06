import { supabase } from './supabase';

export type AppNotification = {
  id: string;
  type: string;
  post_id: string | null;
  comment_id: string | null;
  meta: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
  actor: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
};

export async function fetchNotifications(limit = 40): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      id, type, post_id, comment_id, meta, read_at, created_at,
      profiles!notifications_actor_id_fkey ( id, handle, display_name, avatar_url )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.warn('fetchNotifications', error?.message);
    return [];
  }

  return data.map((n: any) => ({
    id: n.id,
    type: n.type,
    post_id: n.post_id,
    comment_id: n.comment_id,
    meta: n.meta,
    read_at: n.read_at,
    created_at: n.created_at,
    actor: n.profiles
      ? {
          id: n.profiles.id,
          handle: n.profiles.handle,
          display_name: n.profiles.display_name,
          avatar_url: n.profiles.avatar_url,
        }
      : null,
  }));
}

export async function unreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);

  if (error) return 0;
  return count || 0;
}

export async function markAllNotificationsRead() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', auth.user.id)
    .is('read_at', null);
}

export async function markNotificationRead(id: string) {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
}

export function notificationCopy(n: AppNotification): string {
  const who = n.actor?.display_name || n.actor?.handle || 'Someone';
  switch (n.type) {
    case 'like':
      return `${who} liked your post`;
    case 'reaction':
      return `${who} reacted to your post`;
    case 'comment':
      return `${who} commented on your post`;
    case 'follow':
      return `${who} started following you`;
    case 'repost':
      return `${who} reposted your post`;
    default:
      return `${who} interacted with you`;
  }
}
