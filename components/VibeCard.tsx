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
      {vibe.coverUrl ? (
        <Image source={{ uri: vibe.coverUrl }} style={styles.cover} />
      ) : (
        <LinearGradient
          colors={['#1A1030', '#0B0B12']}
          style={styles.cover}
        />
      )}
      <View style={styles.body}>
        <View style={styles.badgeRow}>
          <Ionicons name="heart" size={12} color={colors.primary} />
          <Text style={styles.badge}>VIBE</Text>
          <View style={styles.badgeLine} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {vibe.moodTitle}
        </Text>
        {vibe.moodSubtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {vibe.moodSubtitle}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Ionicons name="musical-notes" size={14} color={colors.primary} />
          <Text style={styles.meta} numberOfLines={1}>
            {vibe.trackName}  {vibe.trackArtist}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="film-outline" size={14} color={colors.primary} />
          <Text style={styles.meta} numberOfLines={1}>
            {vibe.movieTitle}  {vibe.movieYear}
            {vibe.movieDirector ? `  ${vibe.movieDirector}` : ''}
          </Text>
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
    marginTop: spacing.md,
  },
  cover: {
    width: '100%',
    height: 120,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
    opacity: 0.35,
    marginLeft: 4,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
});
