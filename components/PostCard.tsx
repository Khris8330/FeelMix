import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import {
  addComment,
  deletePost,
  fetchComments,
  formatRelativeTime,
  setReaction,
  toggleRepost,
  updatePostBody,
  updatePostVisibility,
  type CommentItem,
  type FeedPost,
} from '@/lib/posts';
import { initials } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { VibeCard } from './VibeCard';
import { AppIcon } from './AppIcon';
import { PostImages } from './PostImages';

type Props = {
  post: FeedPost;
  onRemoved?: (postId: string) => void;
};

const REACTIONS: { type: string; emoji: string; label: string }[] = [
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
];

function reactionEmoji(type: string | null) {
  return REACTIONS.find((r) => r.type === type)?.emoji || '❤️';
}

export function PostCard({ post, onRemoved }: Props) {
  const router = useRouter();
  const user = post.author;
  const [meId, setMeId] = useState<string | null>(null);
  const [reaction, setReactionLocal] = useState<string | null>(post.my_reaction);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [reposted, setReposted] = useState(post.reposted_by_me);
  const [repostCount, setRepostCount] = useState(post.reposts_count);
  const [visibility, setVisibility] = useState(post.visibility || 'public');
  const [body, setBody] = useState(post.body);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(post.body);
  const [saving, setSaving] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (post.my_reaction) setReactionLocal(post.my_reaction);
  }, [post.my_reaction]);

  const isOwner = !!meId && (meId === post.author_id || meId === user.id);
  const name = user.display_name || user.handle;
  const imageUrls =
    post.image_urls?.length ? post.image_urls : post.image_url ? [post.image_url] : [];

  const vibe = post.vibe
    ? {
        moodTitle: post.vibe.mood_title,
        moodSubtitle: post.vibe.mood_subtitle || undefined,
        trackName: post.vibe.track_name,
        trackArtist: post.vibe.track_artist,
        movieTitle: post.vibe.movie_title,
        movieYear: post.vibe.movie_year || '',
        movieDirector: post.vibe.movie_director || undefined,
        coverUrl: post.vibe.cover_url || undefined,
      }
    : null;

  const openPost = () => router.push(`/post/${post.id}`);

  const applyReaction = async (type: string | null) => {
    const prev = reaction;
    const prevCount = likeCount;
    const had = !!prev;
    const next = type === prev ? null : type;
    setReactionLocal(next);
    setLikeCount((c) => {
      if (had && !next) return Math.max(0, c - 1);
      if (!had && next) return c + 1;
      return c;
    });
    setPickerOpen(false);
    const { error } = await setReaction(post.id, next);
    if (error) {
      setReactionLocal(prev);
      setLikeCount(prevCount);
      console.warn('reaction failed', error.message);
    }
  };

  const onRepost = async () => {
    const next = !reposted;
    setReposted(next);
    setRepostCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    const { error } = await toggleRepost(post.id, reposted);
    if (error) {
      setReposted(reposted);
      setRepostCount(post.reposts_count);
    }
  };

  const openComments = async () => {
    setCommentsOpen(true);
    setLoadingComments(true);
    const list = await fetchComments(post.id);
    setComments(list);
    setLoadingComments(false);
  };

  const sendComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    const { error } = await addComment(post.id, commentText);
    setSending(false);
    if (error) {
      Alert.alert('Could not comment', error.message);
      return;
    }
    setCommentText('');
    setCommentCount((c) => c + 1);
    const list = await fetchComments(post.id);
    setComments(list);
  };

  const onShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/post/${post.id}`
        : `https://feel-mix.vercel.app/post/${post.id}`;
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({ title: 'Krimie', text: body.slice(0, 120), url });
        return;
      }
    } catch {}
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        Alert.alert('Link copied', 'Post link copied to clipboard.');
        return;
      }
    } catch {}
    Alert.alert('Share', url);
  };

  const onDelete = () => {
    setMenuOpen(false);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const { error } = await deletePost(post.id);
    setDeleting(false);
    setDeleteOpen(false);
    if (error) {
      if (typeof window !== 'undefined') window.alert(error.message);
      else Alert.alert('Could not delete', error.message);
      return;
    }
    onRemoved?.(post.id);
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      Alert.alert('Empty post', 'Write something before saving.');
      return;
    }
    setSaving(true);
    const { error } = await updatePostBody(post.id, editText);
    setSaving(false);
    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    setBody(editText.trim());
    setEditOpen(false);
  };

  const setPrivacy = async (v: 'public' | 'followers' | 'private') => {
    setSaving(true);
    const { error } = await updatePostVisibility(post.id, v);
    setSaving(false);
    if (error) {
      Alert.alert('Could not update privacy', error.message);
      return;
    }
    setVisibility(v);
    setPrivacyOpen(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable style={styles.userRow} onPress={() => router.push(`/user/${user.id}`)}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{initials(name)}</Text>
            </View>
          )}
          <View style={styles.userMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              {user.status_emoji ? <Text style={styles.statusEmoji}>{user.status_emoji}</Text> : null}
              {user.is_verified ? (
                <AppIcon name="checkmark-circle" size={14} color={colors.primary} />
              ) : null}
            </View>
            <Text style={styles.meta}>
              {formatRelativeTime(post.created_at)}
              {visibility === 'private'
                ? ' · Private'
                : visibility === 'followers'
                  ? ' · Followers'
                  : ' · 🌐'}
            </Text>
          </View>
        </Pressable>
        <Pressable hitSlop={12} style={styles.moreBtn} onPress={() => setMenuOpen(true)}>
          <AppIcon name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable onPress={openPost}>{body ? <Text style={styles.body}>{body}</Text> : null}</Pressable>
      <Pressable onPress={openPost}>
        <PostImages urls={imageUrls} />
      </Pressable>
      {vibe ? <VibeCard vibe={vibe} compact /> : null}

      <View style={styles.stats}>
        <View style={styles.statLeft}>
          <View style={styles.reactionStack}>
            <View style={[styles.reactionDot, { backgroundColor: colors.primary }]}>
              <Text style={styles.reactionEmoji}>{reaction ? reactionEmoji(reaction) : '❤️'}</Text>
            </View>
            <View style={[styles.reactionDot, styles.reactionOverlap, { backgroundColor: '#FBBF24' }]}>
              <Text style={styles.reactionEmoji}>😂</Text>
            </View>
            <View style={[styles.reactionDot, styles.reactionOverlap, { backgroundColor: '#FB923C' }]}>
              <Text style={styles.reactionEmoji}>🔥</Text>
            </View>
          </View>
          <Text style={styles.statText}>{likeCount}</Text>
        </View>
        <Pressable onPress={openPost}>
          <Text style={styles.statText}>
            {commentCount} comments · {repostCount} reposts
          </Text>
        </Pressable>
      </View>

      {pickerOpen ? (
        <View style={styles.picker}>
          {REACTIONS.map((r) => (
            <Pressable
              key={r.type}
              style={[styles.pickerItem, reaction === r.type && styles.pickerItemActive]}
              onPress={() => applyReaction(r.type)}
            >
              <Text style={styles.pickerEmoji}>{r.emoji}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={styles.action}
          onPress={() => applyReaction(reaction ? null : 'love')}
          onLongPress={() => setPickerOpen((v) => !v)}
          delayLongPress={200}
        >
          {reaction ? (
            <Text style={{ fontSize: 16 }}>{reactionEmoji(reaction)}</Text>
          ) : (
            <AppIcon name="heart-outline" size={18} color={colors.textSecondary} />
          )}
          <Text style={[styles.actionLabel, !!reaction && styles.actionLabelActive]}>
            {reaction ? REACTIONS.find((r) => r.type === reaction)?.label || 'Like' : 'Like'}
          </Text>
        </Pressable>
        <Pressable style={styles.action} onPress={openComments}>
          <AppIcon name="chatbubble-outline" size={17} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onRepost}>
          <AppIcon name="repost" size={18} color={reposted ? colors.success : colors.textSecondary} />
          <Text style={[styles.actionLabel, reposted && { color: colors.success }]}>Repost</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onShare}>
          <AppIcon name="share-outline" size={17} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuSheet}>
            {isOwner ? (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    setEditText(body);
                    setEditOpen(true);
                  }}
                >
                  <Text style={styles.menuText}>Edit post</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuOpen(false);
                    setPrivacyOpen(true);
                  }}
                >
                  <Text style={styles.menuText}>Change privacy</Text>
                </Pressable>
                <Pressable style={styles.menuItem} onPress={onDelete}>
                  <Text style={[styles.menuText, { color: '#F87171' }]}>Delete</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  Alert.alert('Report', 'Thanks. We will review this post.');
                }}
              >
                <Text style={styles.menuText}>Report post</Text>
              </Pressable>
            )}
            <Pressable style={styles.menuItem} onPress={() => setMenuOpen(false)}>
              <Text style={[styles.menuText, { color: colors.textMuted }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setDeleteOpen(false)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Delete post?</Text>
            <Text style={{ color: colors.textSecondary, paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
              This cannot be undone.
            </Text>
            <Pressable style={styles.menuItem} onPress={confirmDelete} disabled={deleting}>
              <Text style={[styles.menuText, { color: '#F87171' }]}>{deleting ? 'Deleting...' : 'Delete'}</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => setDeleteOpen(false)}>
              <Text style={[styles.menuText, { color: colors.textMuted }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={privacyOpen} transparent animationType="fade" onRequestClose={() => setPrivacyOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setPrivacyOpen(false)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Who can see this?</Text>
            {(
              [
                { id: 'public', label: 'Public' },
                { id: 'followers', label: 'Followers only' },
                { id: 'private', label: 'Only me' },
              ] as const
            ).map((opt) => (
              <Pressable key={opt.id} style={styles.menuItem} onPress={() => setPrivacy(opt.id)} disabled={saving}>
                <Text
                  style={[
                    styles.menuText,
                    visibility === opt.id && { color: colors.primary, fontWeight: '800' },
                  ]}
                >
                  {opt.label}
                  {visibility === opt.id ? ' ✓' : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={editOpen} animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.editRoot}>
          <View style={styles.editHeader}>
            <Pressable onPress={() => setEditOpen(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.editTitle}>Edit post</Text>
            <Pressable onPress={saveEdit} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.done}>Save</Text>}
            </Pressable>
          </View>
          <TextInput
            style={styles.editInput}
            multiline
            value={editText}
            onChangeText={setEditText}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </Modal>

      <Modal visible={commentsOpen} animationType="slide" transparent onRequestClose={() => setCommentsOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.modalBackdrop} onPress={() => setCommentsOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Comments</Text>
            {loadingComments ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 320 }}
                ListEmptyComponent={<Text style={styles.emptyComments}>Be the first to comment.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.commentRow}>
                    {item.author.avatar_url ? (
                      <Image source={{ uri: item.author.avatar_url }} style={styles.commentAvatar} />
                    ) : (
                      <View style={[styles.commentAvatar, styles.avatarFallback]}>
                        <Text style={styles.commentInitials}>
                          {initials(item.author.display_name || item.author.handle || '?')}
                        </Text>
                      </View>
                    )}
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentName}>{item.author.display_name || item.author.handle}</Text>
                      <Text style={styles.commentBody}>{item.body}</Text>
                      <Text style={styles.commentTime}>{formatRelativeTime(item.created_at)}</Text>
                    </View>
                  </View>
                )}
              />
            )}
            <View style={styles.composer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
              />
              <Pressable onPress={sendComment} disabled={sending} style={styles.sendBtn}>
                {sending ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.sendText}>Post</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceElevated },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: colors.text, fontSize: 13, fontWeight: '800' },
  userMeta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  statusEmoji: { fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  moreBtn: { padding: 6 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22, marginBottom: spacing.md },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactionStack: { flexDirection: 'row', alignItems: 'center' },
  reactionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  reactionOverlap: { marginLeft: -6 },
  reactionEmoji: { fontSize: 9 },
  statText: { color: colors.textMuted, fontSize: 12 },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerItem: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pickerItemActive: { backgroundColor: 'rgba(255,61,138,0.15)' },
  pickerEmoji: { fontSize: 22 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.xs },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.md,
  },
  actionLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  actionLabelActive: { color: colors.primary },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  menuItem: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  editRoot: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.xxl },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancel: { color: colors.textSecondary, fontSize: 15 },
  editTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  done: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  editInput: {
    margin: spacing.xl,
    minHeight: 160,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: spacing.md },
  emptyComments: { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.xl },
  commentRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated },
  commentInitials: { color: colors.text, fontSize: 11, fontWeight: '800' },
  commentBubble: { flex: 1, backgroundColor: colors.bg, borderRadius: radii.lg, padding: spacing.md },
  commentName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  commentBody: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  commentTime: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  commentInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  sendText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
