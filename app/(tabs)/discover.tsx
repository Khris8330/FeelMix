import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
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
import { fetchFeedPosts, type FeedPost } from '@/lib/posts';

export default function DiscoverScreen() {
  const router = useRouter();
  const [vibePosts, setVibePosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const posts = await fetchFeedPosts(60);
    setVibePosts(posts.filter((p) => p.vibe));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
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

          <Text style={styles.section}>Trending vibes</Text>
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
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
});
