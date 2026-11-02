import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { getUser, type Post } from '@/data/mock';
import { VibeCard } from './VibeCard';
import { AppIcon } from './AppIcon';

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  const router = useRouter();
  const user = getUser(post.userId);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes);

  if (!user) return null;

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          style={styles.userRow}
          onPress={() => router.push(`/user/${user.id}`)}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.userMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {user.verified ? (
                <AppIcon name="checkmark-circle" size={14} color={colors.primary} />
              ) : null}
            </View>
            <Text style={styles.meta}>{post.createdAt}</Text>
          </View>
        </Pressable>
        <Pressable hitSlop={12} style={styles.moreBtn}>
          <AppIcon name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.body}>{post.body}</Text>

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : null}

      {post.vibe ? <VibeCard vibe={post.vibe} compact /> : null}

      <View style={styles.stats}>
        <View style={styles.statLeft}>
          <View style={styles.likePill}>
            <AppIcon name="heart" size={11} color={colors.white} />
          </View>
          <Text style={styles.statText}>{likeCount}</Text>
        </View>
        <Text style={styles.statText}>
          {post.comments} comments · {post.shares} shares
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={toggleLike}>
          <AppIcon
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.actionLabel, liked && styles.actionLabelActive]}>
            Like
          </Text>
        </Pressable>
        <Pressable style={styles.action}>
          <AppIcon name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>
        <Pressable style={styles.action}>
          <AppIcon name="arrow-redo-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
      </View>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: 'rgba(255,61,138,0.35)',
  },
  userMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  moreBtn: {
    padding: 6,
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 210,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likePill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionLabelActive: {
    color: colors.primary,
  },
});
