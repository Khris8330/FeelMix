import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing } from '@/constants/theme';
import type { VibeEmbed } from '@/data/mock';

type Props = {
  vibe: VibeEmbed;
  compact?: boolean;
};

export function VibeCard({ vibe, compact }: Props) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.topRow}>
        {vibe.coverUrl ? (
          <Image source={{ uri: vibe.coverUrl }} style={styles.cover} />
        ) : (
          <LinearGradient
            colors={['#2A1530', '#0B0B12']}
            style={styles.cover}
          />
        )}
        <View style={styles.main}>
          <View style={styles.badgeRow}>
            <Ionicons name="heart" size={11} color={colors.primary} />
            <Text style={styles.badge}>VIBE</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {vibe.moodTitle}
          </Text>
          {vibe.moodSubtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {vibe.moodSubtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <View style={styles.metaIcon}>
            <Ionicons name="musical-notes" size={14} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.metaLabel}>TRACK</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {vibe.trackName}
            </Text>
            <Text style={styles.metaSub} numberOfLines={1}>
              {vibe.trackArtist}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaIcon}>
            <Ionicons name="film-outline" size={14} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.metaLabel}>MOVIE</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {vibe.movieTitle}
            </Text>
            <Text style={styles.metaSub} numberOfLines={1}>
              {vibe.movieYear}
              {vibe.movieDirector ? ` · ${vibe.movieDirector}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompact: {
    marginTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  cover: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badge: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  metaBlock: {
    padding: spacing.md,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,61,138,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metaValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  },
  metaSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
});
