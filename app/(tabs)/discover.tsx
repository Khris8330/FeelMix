import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing } from '@/constants/theme';
import { lifeEvents, posts } from '@/data/mock';
import { VibeCard } from '@/components/VibeCard';

export default function DiscoverScreen() {
  const router = useRouter();
  const vibePosts = posts.filter((p) => p.vibe);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.push('/mood')}>
          <LinearGradient
            colors={[colors.primary, colors.coral]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Ionicons name="sparkles" size={28} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>How are you feeling?</Text>
              <Text style={styles.heroSub}>
                Turn your mood into music, movies, and moments.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
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
        {vibePosts.map((p) =>
          p.vibe ? (
            <View key={p.id} style={{ marginBottom: spacing.md }}>
              <VibeCard vibe={p.vibe} />
            </View>
          ) : null
        )}
      </ScrollView>
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
});
