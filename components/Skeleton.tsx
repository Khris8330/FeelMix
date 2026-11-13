import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';

type BoneProps = {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
};

export function Bone({ width, height, radius = 8, style }: BoneProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceElevated,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function PostSkeleton() {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Bone width={40} height={40} radius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Bone width="45%" height={12} />
          <Bone width="28%" height={10} />
        </View>
      </View>
      <Bone width="92%" height={12} style={{ marginBottom: 8 }} />
      <Bone width="78%" height={12} style={{ marginBottom: 12 }} />
      <Bone width="100%" height={160} radius={radii.lg} />
      <View style={styles.postActions}>
        <Bone width={56} height={12} />
        <Bone width={64} height={12} />
        <Bone width={52} height={12} />
      </View>
    </View>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.feed}>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.profile}>
      <Bone width={96} height={96} radius={48} style={{ alignSelf: 'center' }} />
      <Bone width={140} height={18} style={{ alignSelf: 'center', marginTop: spacing.md }} />
      <Bone width={100} height={12} style={{ alignSelf: 'center', marginTop: spacing.sm }} />
      <View style={styles.statsRow}>
        <Bone width={48} height={28} />
        <Bone width={48} height={28} />
        <Bone width={48} height={28} />
      </View>
      <Bone width={120} height={36} radius={radii.pill} style={{ alignSelf: 'center', marginTop: spacing.xl }} />
      <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
        <PostSkeleton />
        <PostSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feed: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  profile: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxxl,
    marginTop: spacing.xl,
  },
});
