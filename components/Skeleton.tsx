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
      <Bone
        width={120}
        height={36}
        radius={radii.pill}
        style={{ alignSelf: 'center', marginTop: spacing.xl }}
      />
      <View style={{ marginTop: spacing.xxl, gap: spacing.md }}>
        <PostSkeleton />
        <PostSkeleton />
      </View>
    </View>
  );
}

/** Matches edit-profile layout */
export function EditProfileSkeleton() {
  return (
    <View style={styles.editRoot}>
      <View style={styles.topBar}>
        <Bone width={28} height={28} radius={14} />
        <Bone width={100} height={16} />
        <Bone width={40} height={16} />
      </View>
      <Bone width={110} height={110} radius={55} style={{ alignSelf: 'center', marginTop: spacing.md }} />
      <Bone width={100} height={14} style={{ alignSelf: 'center', marginTop: spacing.md }} />
      <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
        <Bone width={60} height={10} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Bone key={i} width={40} height={40} radius={20} />
          ))}
        </View>
        <Bone width={40} height={10} />
        <Bone width="100%" height={44} radius={radii.md} />
        <Bone width={40} height={10} />
        <Bone width="100%" height={44} radius={radii.md} />
        <Bone width={40} height={10} />
        <Bone width="100%" height={100} radius={radii.md} />
      </View>
    </View>
  );
}

export function MessagesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.listPad}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.msgRow}>
          <Bone width={48} height={48} radius={24} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Bone width="40%" height={12} />
              <Bone width={36} height={10} />
            </View>
            <Bone width="70%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ChatSkeleton() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <Bone width={40} height={40} radius={20} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Bone width={32} height={32} radius={16} />
          <Bone width={100} height={14} />
        </View>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <Bone width="55%" height={40} radius={radii.lg} style={{ alignSelf: 'flex-start' }} />
        <Bone width="65%" height={40} radius={radii.lg} style={{ alignSelf: 'flex-end' }} />
        <Bone width="45%" height={36} radius={radii.lg} style={{ alignSelf: 'flex-start' }} />
        <Bone width="70%" height={48} radius={radii.lg} style={{ alignSelf: 'flex-end' }} />
        <Bone width="50%" height={36} radius={radii.lg} style={{ alignSelf: 'flex-start' }} />
      </View>
      <View style={styles.composer}>
        <Bone width="80%" height={42} radius={radii.lg} />
        <Bone width={42} height={42} radius={21} />
      </View>
    </View>
  );
}

export function DiscoverSkeleton() {
  return (
    <View style={styles.listPad}>
      <Bone width="100%" height={88} radius={radii.xl} style={{ marginBottom: spacing.xxl }} />
      <Bone width={100} height={14} style={{ marginBottom: spacing.md }} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.xxl }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} width={88} height={32} radius={radii.pill} />
        ))}
      </View>
      <Bone width={120} height={14} style={{ marginBottom: spacing.md }} />
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} width={140} height={160} radius={radii.xl} />
        ))}
      </View>
      <Bone width={110} height={14} style={{ marginBottom: spacing.md }} />
      <PostSkeleton />
      <PostSkeleton />
    </View>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <View style={styles.listPad}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.listRow}>
          <Bone width={40} height={40} radius={20} />
          <View style={{ flex: 1, gap: 8 }}>
            <Bone width="55%" height={12} />
            <Bone width="80%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SettingsSkeleton() {
  return (
    <View style={styles.listPad}>
      <View style={styles.topBar}>
        <Bone width={28} height={28} radius={14} />
        <Bone width={80} height={16} />
        <View style={{ width: 28 }} />
      </View>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.settingRow}>
          <Bone width="40%" height={14} />
          <Bone width={44} height={26} radius={13} />
        </View>
      ))}
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
  editRoot: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  listPad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
