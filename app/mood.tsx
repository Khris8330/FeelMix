import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing } from '@/constants/theme';
import { lifeEvents } from '@/data/mock';
import { VibeCard } from '@/components/VibeCard';
import { AppIcon } from '@/components/AppIcon';
import type { VibeEmbed } from '@/data/mock';

const MOCK_RESULT: VibeEmbed = {
  moodTitle: 'Echoes of What Was',
  moodSubtitle: 'Soft, honest songs and stories that understand.',
  trackName: 'The Night We Met',
  trackArtist: 'Lord Huron',
  movieTitle: 'Eternal Sunshine of the Spotless Mind',
  movieYear: '2004',
  movieDirector: 'Michel Gondry',
  coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
};

export default function MoodScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>('heartbreak');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VibeEmbed | null>(null);

  const run = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setLoading(false);
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <AppIcon name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mood mix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brandTitle}>Mood Mix</Text>
        <Text style={styles.headline}>How are you feeling?</Text>
        <Text style={styles.sub}>
          Turn your mood into music, movies, and moments.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
        >
          {lifeEvents.map((e) => {
            const active = selected === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => setSelected(e.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {e.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <TextInput
          style={styles.input}
          placeholder="Describe your vibe..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={text}
          onChangeText={setText}
        />

        <Pressable onPress={run} disabled={loading}>
          <LinearGradient
            colors={[colors.primary, colors.coral]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.ctaText}>Find my mix</Text>
            )}
          </LinearGradient>
        </Pressable>

        {result ? (
          <View style={styles.result}>
            <VibeCard vibe={result} />
            <Text style={styles.aiLabel}>AI insight</Text>
            <Text style={styles.aiText}>
              This mix captures the ache of letting go, the quiet memories, and
              the hope that comes after.
            </Text>
            <Pressable
              style={styles.shareBtn}
              onPress={() => {
                router.replace('/(tabs)');
              }}
            >
              <AppIcon name="share-outline" size={18} color={colors.white} />
              <Text style={styles.shareText}>Share to feed</Text>
            </Pressable>
            <Text style={styles.privateNote}>
              Your vibe stays private until you share.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  brandTitle: {
    alignSelf: 'center',
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: spacing.md,
  },
  headline: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  chips: { marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,61,138,0.12)',
  },
  chipText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.primary },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  cta: {
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  result: { marginTop: spacing.xxl, gap: spacing.md },
  aiLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  aiText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
  },
  shareText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  privateNote: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
