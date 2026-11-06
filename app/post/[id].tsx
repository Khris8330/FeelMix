import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { PostCard } from '@/components/PostCard';
import { supabase } from '@/lib/supabase';
import {
  addComment,
  fetchComments,
  formatRelativeTime,
  type CommentItem,
  type FeedPost,
} from '@/lib/posts';
import { initials } from '@/lib/profile';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;

    const { data } = await supabase
      .from('posts')
      .select(
        `
        id, body, image_url, likes_count, comments_count, reposts_count, shares_count, created_at,
        profiles!posts_author_id_fkey ( id, handle, display_name, avatar_url, is_verified, status_emoji ),
        vibes ( mood_title, mood_subtitle, track_name, track_artist, movie_title, movie_year, movie_director, cover_url ),
        post_images ( url, sort_order )
      `
      )
      .eq('id', id)
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
        likes_count: data.likes_count,
        comments_count: data.comments_count,
        reposts_count: data.reposts_count,
        shares_count: data.shares_count,
        created_at: data.created_at,
        author: {
          id: author.id,
          handle: author.handle,
          display_name: author.display_name,
          avatar_url: author.avatar_url,
          is_verified: !!author.is_verified,
          status_emoji: author.status_emoji,
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
    }

    const list = await fetchComments(id);
    setComments(list);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const send = async () => {
    if (!id || !text.trim()) return;
    setSending(true);
    await addComment(id, text);
    setText('');
    const list = await fetchComments(id);
    setComments(list);
    setSending(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <AppIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !post ? (
        <View style={styles.boot}>
          <Text style={styles.missing}>Post not found.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
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
            <PostCard post={post} />

            <Text style={styles.section}>Comments</Text>
            {comments.length === 0 ? (
              <Text style={styles.empty}>No comments yet. Say something.</Text>
            ) : (
              comments.map((c) => {
                const n = c.author.display_name || c.author.handle || '?';
                return (
                  <View key={c.id} style={styles.commentRow}>
                    {c.author.avatar_url ? (
                      <Image source={{ uri: c.author.avatar_url }} style={styles.cAvatar} />
                    ) : (
                      <View style={[styles.cAvatar, styles.fallback]}>
                        <Text style={styles.initials}>{initials(n)}</Text>
                      </View>
                    )}
                    <View style={styles.bubble}>
                      <Text style={styles.cName}>{n}</Text>
                      <Text style={styles.cBody}>{c.body}</Text>
                      <Text style={styles.cTime}>{formatRelativeTime(c.created_at)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
            />
            <Pressable style={styles.send} onPress={send} disabled={sending}>
              {sending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.sendText}>Post</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
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
    borderColor: colors.border,
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 17 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missing: { color: colors.textMuted },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  section: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  empty: { color: colors.textMuted, marginBottom: spacing.lg },
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
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
  },
  send: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  sendText: { color: colors.white, fontWeight: '700' },
});
