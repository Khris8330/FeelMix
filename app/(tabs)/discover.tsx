import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing } from '@/constants/theme';
import { lifeEvents } from '@/data/mock';
import { VibeCard } from '@/components/VibeCard';
import { AppIcon } from '@/components/AppIcon';
import { EmptyState } from '@/components/EmptyState';
import { PostCard } from '@/components/PostCard';
import { DiscoverSkeleton } from '@/components/Skeleton';
import { type FeedPost } from '@/lib/posts';
import {
  fetchSuggestedPeople,
  fetchTrendingPosts,
  fetchTrendingVibes,
  type DiscoverPerson,
} from '@/lib/discover';
import { followUser, unfollowUser } from '@/lib/follows';
import { initials } from '@/lib/profile';

export default function DiscoverScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState<FeedPost[]>([]);
  const [vibePosts, setVibePosts] = useState<FeedPost[]>([]);
  const [people, setPeople] = useState<DiscoverPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, v, p] = await Promise.all([
        fetchTrendingPosts(12),
        fetchTrendingVibes(8),
        fetchSuggestedPeople(10),
      ]);
      setTrending(t);
      setVibePosts(v);
      setPeople(p);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleFollow = async (person: DiscoverPerson) => {
    setBusyId(person.id);
    if (person.is_following) {
      await unfollowUser(person.id);
      setPeople((list) =>
        list.map((p) => (p.id === person.id ? { ...p, is_following: false } : p))
      );
    } else {
      await followUser(person.id);
      setPeople((list) =>
        list.map((p) => (p.id === person.id ? { ...p, is_following: true } : p))
      );
    }
    setBusyId(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {loading ? (
        <DiscoverSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
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
          <Pressable onPress={() => router.push('/mood')}>
            <LinearGradient
              colors={[colors.primary, colors.coral]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <AppIcon name="sparkles" size={26} color={colors.white} />
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>How are you feeling?</Text>
                <Text style={styles.heroSub}>
                  Turn your mood into music, movies, and moments.
                </Text>
              </View>
              <AppIcon name="chevron-forward" size={20} color={colors.white} />
            </LinearGradient>
          </Pressable>

          <Text style={styles.section}>Life events</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {lifeEvents.map((e) => (
              <Pressable
                key={e.id}
                style={styles.chip}
                onPress={() => router.push('/mood')}
              >
                <Text style={styles.chipText}>{e.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.section}>People to follow</Text>
          {people.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: spacing.xxl }}
            >
              {people.map((p) => {
                const name = p.display_name || p.handle;
                return (
                  <View key={p.id} style={styles.personCard}>
                    <Pressable onPress={() => router.push(`/user/${p.id}`)}>
                      {p.avatar_url ? (
                        <Image source={{ uri: p.avatar_url }} style={styles.personAvatar} />
                      ) : (
                        <View style={[styles.personAvatar, styles.fallback]}>
                          <Text style={styles.personInitials}>{initials(name)}</Text>
                        </View>
                      )}
                      <Text style={styles.personName} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.personHandle} numberOfLines={1}>
                        @{p.handle}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.followBtn, p.is_following && styles.followingBtn]}
                      onPress={() => toggleFollow(p)}
                      disabled={busyId === p.id}
                    >
                      {busyId === p.id ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <Text style={styles.followText}>
                          {p.is_following ? 'Following' : 'Follow'}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.muted}>No suggestions right now.</Text>
          )}

          <Text style={styles.section}>Trending now</Text>
          {trending.length ? (
            trending.map((p) => (
              <View key={p.id} style={{ marginBottom: spacing.md }}>
                <PostCard post={p} />
              </View>
            ))
          ) : (
            <EmptyState
              icon="flame-outline"
              title="Nothing trending yet"
              subtitle="Post, react, and share vibes to heat up the feed."
              actionLabel="Create a post"
              onAction={() => router.push('/(tabs)/create')}
            />
          )}

          <Text style={[styles.section, { marginTop: spacing.xl }]}>Trending vibes</Text>
          {vibePosts.length ? (
            vibePosts.map((p) =>
              p.vibe ? (
                <Pressable
                  key={p.id}
                  style={{ marginBottom: spacing.md }}
                  onPress={() => router.push(`/post/${p.id}`)}
                >
                  <VibeCard
                    vibe={{
                      moodTitle: p.vibe.mood_title,
                      moodSubtitle: p.vibe.mood_subtitle || undefined,
                      trackName: p.vibe.track_name,
                      trackArtist: p.vibe.track_artist,
                      movieTitle: p.vibe.movie_title,
                      movieYear: p.vibe.movie_year || '',
                      movieDirector: p.vibe.movie_director || undefined,
                      coverUrl: p.vibe.cover_url || undefined,
                    }}
                  />
                </Pressable>
              ) : null
            )
          ) : (
            <EmptyState
              icon="musical-notes"
              title="No vibes yet"
              subtitle="Share a Mood Mix and it will show up here for others to discover."
              actionLabel="Open Mood Mix"
              onAction={() => router.push('/mood')}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    marginBottom: spacing.xxl,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  chips: {
    marginBottom: spacing.xxl,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  personCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  personAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceElevated,
    alignSelf: 'center',
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  personInitials: { color: colors.text, fontWeight: '800', fontSize: 18 },
  personName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  personHandle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  followBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    minWidth: 96,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  muted: { color: colors.textMuted, marginBottom: spacing.xl },
});
