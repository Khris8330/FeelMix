import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { PostCard } from '@/components/PostCard';
import { StoryRail } from '@/components/StoryRail';
import { MenuSheet } from '@/components/MenuSheet';
import { AppIcon } from '@/components/AppIcon';
import { fetchMyProfile, initials, type Profile } from '@/lib/profile';
import { fetchFeedPosts, type FeedPost } from '@/lib/posts';
import { unreadNotificationCount } from '@/lib/notifications';

const HEADER_ICON_SIZE = 24;

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<Profile | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const [profile, posts, count] = await Promise.all([
      fetchMyProfile(),
      fetchFeedPosts(),
      unreadNotificationCount(),
    ]);
    setMe(profile);
    setFeed(posts);
    setUnread(count);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const name = me?.display_name || me?.handle || '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Kri<Text style={styles.logoAccent}>mie</Text>
        </Text>
        <View style={styles.headerActions}>
          <Pressable hitSlop={10} onPress={() => router.push('/search')} style={styles.iconBtn}>
            <AppIcon name="search" size={HEADER_ICON_SIZE} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => router.push('/mood')} style={styles.iconBtn}>
            <AppIcon name="musical-notes" size={HEADER_ICON_SIZE} color={colors.text} />
          </Pressable>
          <Pressable
            hitSlop={10}
            style={styles.iconBtn}
            onPress={() => router.push('/notifications')}
          >
            <AppIcon name="notifications-outline" size={HEADER_ICON_SIZE} color={colors.text} />
            {unread > 0 ? <View style={styles.badgeDot} /> : null}
          </Pressable>
          <Pressable hitSlop={10} onPress={() => setMenuOpen(true)} style={styles.iconBtn}>
            <AppIcon name="menu" size={HEADER_ICON_SIZE} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onRemoved={(id) => setFeed((list) => list.filter((p) => p.id !== id))}
            />
          )}
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
          ListHeaderComponent={
            <View>
              <StoryRail />
              <View style={styles.composerRow}>
                <Pressable onPress={() => router.push('/(tabs)/profile')}>
                  {me?.avatar_url ? (
                    <Image source={{ uri: me.avatar_url }} style={styles.profileAvatar} />
                  ) : (
                    <View style={[styles.profileAvatar, styles.avatarFallback]}>
                      <Text style={styles.avatarInitials}>{initials(name || 'K')}</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  style={styles.composerWrap}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Text style={styles.composerPlaceholder}>What is on your mind?</Text>
                </Pressable>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              No posts yet. Tap + to share the first one on Krimie.
            </Text>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}

      <MenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  logoAccent: {
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  composerWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  composerPlaceholder: {
    color: colors.textMuted,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sep: {
    height: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    fontSize: 14,
    lineHeight: 20,
  },
});
