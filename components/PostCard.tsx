import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { getUser, type Post } from '@/data/mock';
import { VibeCard } from './VibeCard';

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
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {user.verified ? (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              ) : null}
            </View>
            <Text style={styles.meta}>
              {post.createdAt}  Public
            </Text>
          </View>
        </Pressable>
        <Pressable hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.body}>{post.body}</Text>

      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : null}

      {post.vibe ? <VibeCard vibe={post.vibe} compact /> : null}

      <View style={styles.stats}>
        <Text style={styles.statText}>{likeCount}</Text>
        <Ionicons name="heart" size={12} color={colors.primary} />
        <Text style={[styles.statText, { marginLeft: 12 }]}>
          {post.comments} comments
        </Text>
        <Text style={[styles.statText, { marginLeft: 8 }]}>
          {post.shares} shares
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={toggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.actionLabel, liked && { color: colors.primary }]}>
            Like
          </Text>
        </Pressable>
        <Pressable style={styles.action}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>Comment</Text>
        </Pressable>
        <Pressable style={styles.action}>
          <Ionicons name="arrow-redo-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  statText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
