import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing } from '@/constants/theme';
import type { VibeEmbed } from '@/data/mock';
import { AppIcon } from './AppIcon';

type Props = {
  vibe: VibeEmbed;
  compact?: boolean;
};

export function VibeCard({ vibe, compact }: Props) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.topRow}>
        <View style={styles.coverWrap}>
          {vibe.coverUrl ? (
            <Image source={{ uri: vibe.coverUrl }} style={styles.cover} />
          ) : (
            <LinearGradient colors={['#2A1530', '#0B0B12']} style={styles.cover} />
          )}
        </View>
        <View style={styles.main}>
          <Text style={styles.badge}>{vibe.moodSubtitle || 'MY VIBE'}</Text>
          <View style={styles.metaRow}>
            <AppIcon name="musical-notes" size={13} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.metaValue} numberOfLines={1}>
                {vibe.trackName}
              </Text>
              <Text style={styles.metaSub} numberOfLines={1}>
                by {vibe.trackArtist}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <AppIcon name="film-outline" size={13} color={colors.primary} />
            <View style={{ flex: 1 }}>
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
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={[colors.primary, colors.coral]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressFill}
        />
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
    padding: spacing.md,
  },
  cardCompact: {
    marginTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  coverWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cover: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  main: {
    flex: 1,
    gap: 6,
  },
  badge: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  metaSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  progressTrack: {
    marginTop: spacing.md,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '62%',
    height: '100%',
    borderRadius: 2,
  },
});
