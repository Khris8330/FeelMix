import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

/** Subscribe to new notifications for the signed-in user. */
export function subscribeNotifications(
  userId: string,
  onInsert: (row: Record<string, any>) => void
): RealtimeChannel {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onInsert(payload.new as Record<string, any>)
    )
    .subscribe();
}

/** Subscribe to new public feed posts (client still filters visibility via RLS). */
export function subscribeNewPosts(onInsert: (row: Record<string, any>) => void): RealtimeChannel {
  return supabase
    .channel('feed:posts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts' },
      (payload) => onInsert(payload.new as Record<string, any>)
    )
    .subscribe();
}

/** Subscribe to reaction changes for posts currently on screen. */
export function subscribeReactions(
  postIds: string[],
  onChange: (event: 'INSERT' | 'UPDATE' | 'DELETE', row: Record<string, any>) => void
): RealtimeChannel | null {
  if (!postIds.length) return null;

  // Broad subscription; filter client-side by post id set
  const idSet = new Set(postIds);
  return supabase
    .channel(`reactions:${postIds.slice(0, 8).join('-')}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reactions' },
      (payload) => {
        const row = (payload.new || payload.old) as Record<string, any>;
        if (!row?.post_id || !idSet.has(row.post_id)) return;
        onChange(payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE', row);
      }
    )
    .subscribe();
}

export function subscribeMessages(
  conversationId: string,
  onInsert: (row: Record<string, any>) => void
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Record<string, any>)
    )
    .subscribe();
}

export function removeChannel(channel: RealtimeChannel | null | undefined) {
  if (channel) supabase.removeChannel(channel);
}
