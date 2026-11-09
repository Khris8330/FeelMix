import { supabase } from './supabase';

export type DmRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  from_user: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
  to_user: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
  direction: 'incoming' | 'outgoing';
};

export type ConversationPreview = {
  id: string;
  last_message_at: string | null;
  last_body: string | null;
  other: {
    id: string;
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export type ChatMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  mine: boolean;
};

export async function getDmStatus(otherUserId: string): Promise<{
  status: 'none' | 'pending_out' | 'pending_in' | 'accepted' | 'declined';
  requestId?: string;
  conversationId?: string;
}> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { status: 'none' };
  const me = auth.user.id;

  // Existing conversation?
  const { data: myMemberships } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', me);

  const convIds = (myMemberships || []).map((m) => m.conversation_id);
  if (convIds.length) {
    const { data: shared } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', convIds)
      .limit(1)
      .maybeSingle();
    if (shared?.conversation_id) {
      return { status: 'accepted', conversationId: shared.conversation_id };
    }
  }

  const { data: req } = await supabase
    .from('dm_requests')
    .select('id, status, from_user_id, to_user_id')
    .or(
      `and(from_user_id.eq.${me},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${me})`
    )
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!req) return { status: 'none' };
  if (req.status === 'accepted') return { status: 'accepted', requestId: req.id };
  if (req.status === 'declined') return { status: 'declined', requestId: req.id };
  if (req.from_user_id === me) return { status: 'pending_out', requestId: req.id };
  return { status: 'pending_in', requestId: req.id };
}

export async function requestDm(toUserId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), data: null };

  const { data, error } = await supabase
    .from('dm_requests')
    .insert({
      from_user_id: auth.user.id,
      to_user_id: toUserId,
      status: 'pending',
    })
    .select('id')
    .single();

  return { error, data };
}

export async function acceptDmRequest(requestId: string) {
  const { data, error } = await supabase.rpc('accept_dm_request', {
    request_id: requestId,
  });
  return { conversationId: data as string | null, error };
}

export async function declineDmRequest(requestId: string) {
  const { error } = await supabase.rpc('decline_dm_request', {
    request_id: requestId,
  });
  return { error };
}

export async function fetchIncomingRequests(): Promise<DmRequest[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const me = auth.user.id;

  const { data, error } = await supabase
    .from('dm_requests')
    .select(
      `
      id, status, created_at, from_user_id, to_user_id,
      from_profile:profiles!dm_requests_from_user_id_fkey ( id, handle, display_name, avatar_url ),
      to_profile:profiles!dm_requests_to_user_id_fkey ( id, handle, display_name, avatar_url )
    `
    )
    .eq('to_user_id', me)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('fetchIncomingRequests', error?.message);
    return [];
  }

  return data.map((r: any) => ({
    id: r.id,
    status: r.status,
    created_at: r.created_at,
    from_user: r.from_profile,
    to_user: r.to_profile,
    direction: 'incoming' as const,
  }));
}

export async function fetchConversations(): Promise<ConversationPreview[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const me = auth.user.id;

  const { data: memberships, error } = await supabase
    .from('conversation_members')
    .select('conversation_id, conversations ( id, last_message_at )')
    .eq('user_id', me);

  if (error || !memberships?.length) return [];

  const previews: ConversationPreview[] = [];

  for (const m of memberships as any[]) {
    const convId = m.conversation_id;
    const lastAt = m.conversations?.last_message_at || null;

    const { data: otherMember } = await supabase
      .from('conversation_members')
      .select(
        `user_id, profiles!conversation_members_user_id_fkey ( id, handle, display_name, avatar_url )`
      )
      .eq('conversation_id', convId)
      .neq('user_id', me)
      .maybeSingle();

    const { data: lastMsg } = await supabase
      .from('messages')
      .select('body')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const other = (otherMember as any)?.profiles;
    if (!other) continue;

    previews.push({
      id: convId,
      last_message_at: lastAt,
      last_body: lastMsg?.body || null,
      other: {
        id: other.id,
        handle: other.handle,
        display_name: other.display_name,
        avatar_url: other.avatar_url,
      },
    });
  }

  previews.sort((a, b) => {
    const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return tb - ta;
  });

  return previews;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, body, sender_id, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error || !data) {
    console.warn('fetchMessages', error?.message);
    return [];
  }

  return data.map((m) => ({
    id: m.id,
    body: m.body,
    sender_id: m.sender_id,
    created_at: m.created_at,
    read_at: m.read_at,
    mine: m.sender_id === auth.user!.id,
  }));
}

export async function sendMessage(conversationId: string, body: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: new Error('Not signed in'), data: null };

  const text = body.trim();
  if (!text) return { error: new Error('Empty message'), data: null };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: auth.user.id,
      body: text,
    })
    .select('id, body, sender_id, created_at, read_at')
    .single();

  if (!error) {
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return {
    error,
    data: data
      ? {
          id: data.id,
          body: data.body,
          sender_id: data.sender_id,
          created_at: data.created_at,
          read_at: data.read_at,
          mine: true,
        }
      : null,
  };
}

export async function getConversationOther(conversationId: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase
    .from('conversation_members')
    .select(
      `profiles!conversation_members_user_id_fkey ( id, handle, display_name, avatar_url )`
    )
    .eq('conversation_id', conversationId)
    .neq('user_id', auth.user.id)
    .maybeSingle();

  return (data as any)?.profiles || null;
}
