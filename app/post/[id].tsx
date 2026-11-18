import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { PostCard } from '@/components/PostCard';
import { CommentThread } from '@/components/CommentThread';
import { EmptyState } from '@/components/EmptyState';
import { PostSkeleton } from '@/components/Skeleton';
import { supabase } from '@/lib/supabase';
import {
  addComment,
  fetchComments,
  type CommentItem,
  type FeedPost,
} from '@/lib/posts';
import { safeGoBack } from '@/lib/navigation';
import { sharePost, shareVibePost } from '@/lib/share';
import { showError } from '@/lib/toast';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;

    setCommentsLoading(true);
    const { data } = await supabase
      .from('posts')
      .select(
        `
        id, body, image_url, likes_count, comments_count, reposts_count, shares_count, created_at, visibility, author_id,
        profiles!posts_author_id_fkey ( id, handle, display_name, avatar_url, is_verified, status_emoji, is_private ),
        vibes ( mood_title, mood_subtitle, track_name, track_artist, movie_title, movie_year, movie_director, cover_url ),
        post_images ( url, sort_order )
      `
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (data) {
      const author = (data as any).profiles || {};
      const vibeRow = Array.isArray((data as any).vibes)
        ? (data as any).vibes[0]
        : (data as any).vibes;
      const images = Array.isArray((data as any).post_images)
        ? [...(data as any).post_images]
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((i: any) => i.url)
        : [];
      if (!images.length && data.image_url) images.push(data.image_url);

      setPost({
        id: data.id,
        body: data.body,
        image_url: images[0] || null,
        image_urls: images,
        likes_count: data.likes_count ?? 0,
        comments_count: data.comments_count ?? 0,
        reposts_count: data.reposts_count ?? 0,
        shares_count: data.shares_count ?? 0,
        created_at: data.created_at,
        visibility: (data as any).visibility || 'public',
        author_id: (data as any).author_id || author.id,
        author: {
          id: author.id,
          handle: author.handle,
          display_name: author.display_name,
          avatar_url: author.avatar_url,
          is_verified: !!author.is_verified,
          status_emoji: author.status_emoji,
          is_private: !!author.is_private,
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
        liked_by_me: false,
        my_reaction: null,
        reposted_by_me: false,
      });
    } else {
      setPost(null);
    }

    const list = await fetchComments(id);
    setComments(list);
    setCommentsLoading(false);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const send = async (value: string) => {
    if (!id || !value.trim()) return;
    setSending(true);
    const { error } = await addComment(id, value);
    if (error) {
      showError(error.message, 'Could not comment');
      setSending(false);
      return;
    }
    const list = await fetchComments(id);
    setComments(list);
    setPost((p) =>
      p ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
    );
    setSending(false);
  };

  const onShare = async () => {
    if (!post) return;
    if (post.vibe) {
      await shareVibePost(post.id, post.vibe);
    } else {
      await sharePost(post.id, post.body);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => safeGoBack(router)}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Post</Text>
        <Pressable onPress={onShare} hitSlop={12} style={styles.backBtn} disabled={!post}>
          <AppIcon name="share-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.bootPad}>
          <PostSkeleton />
        </View>
      ) : !post ? (
        <EmptyState
          icon="search"
          title="Post not found"
          subtitle="It may have been deleted or is no longer available."
          actionLabel="Go home"
          onAction={() => router.replace('/(tabs)')}
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
                tintColor={colors.primary}
              />
            }
          >
            <PostCard
              post={post}
              onRemoved={() => router.replace('/(tabs)')}
            />

            <Text style={styles.section}>
              Comments{comments.length ? ` · ${comments.length}` : ''}
            </Text>

            {commentsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
            ) : comments.length === 0 ? (
              <EmptyState
                icon="chatbubble-outline"
                title="No comments yet"
                subtitle="Be the first to share your thoughts."
              />
            ) : (
              comments.map((c) => (
                <CommentRow key={c.id} item={c} />
              ))
            )}
          </ScrollView>

          <CommentComposer sending={sending} onSend={send} />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function CommentRow({ item }: { item: CommentItem }) {
  const name = item.author.display_name || item.author.handle || '?';
  const { Image } = require('react-native');
  const { formatRelativeTime } = require('@/lib/posts');
  const { initials } = require('@/lib/profile');

  return (
    <View style={styles.commentRow}>
      {item.author.avatar_url ? (
        <Image source={{ uri: item.author.avatar_url }} style={styles.cAvatar} />
      ) : (
        <View style={[styles.cAvatar, styles.fallback]}>
          <Text style={styles.initials}>{initials(name)}</Text>
        </View>
      )}
      <View style={styles.bubble}>
        <Text style={styles.cName}>{name}</Text>
        <Text style={styles.cBody}>{item.body}</Text>
        <Text style={styles.cTime}>{formatRelativeTime(item.created_at)}</Text>
      </View>
    </View>
  );
}

function CommentComposer({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (text: string) => Promise<void>;
}) {
  const { useState } = require('react');
  const { TextInput, ActivityIndicator } = require('react-native');
  const [text, setText] = useState('');

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    await onSend(value);
  };

  return (
    <View style={styles.composer}>
      <TextInput
        style={styles.input}
        placeholder="Write a comment..."
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        editable={!sending}
        onSubmitEditing={submit}
        returnKeyType="send"
      />
      <Pressable
        style={[styles.send, (!text.trim() || sending) && styles.sendDisabled]}
        onPress={submit}
        disabled={!text.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.sendText}>Post</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 17 },
  bootPad: { padding: spacing.lg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  section: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.text, fontSize: 12, fontWeight: '800' },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  cBody: { color: colors.textSecondary, fontSize: 14, marginTop: 3, lineHeight: 20 },
  cTime: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
  },
  send: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 64,
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: colors.white, fontWeight: '700' },
});
