import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { posts } from '@/data/mock';
import { PostCard } from '@/components/PostCard';
import { StoryRail } from '@/components/StoryRail';
import { MenuSheet } from '@/components/MenuSheet';
import { AppIcon } from '@/components/AppIcon';

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Feel<Text style={styles.logoAccent}>Mix</Text>
        </Text>
        <View style={styles.headerActions}>
          <Pressable hitSlop={10} onPress={() => router.push('/mood')} style={styles.iconBtn}>
            <AppIcon name="musical-notes" size={22} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={10} style={styles.iconBtn}>
            <AppIcon name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.badgeDot} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => setMenuOpen(true)} style={styles.iconBtn}>
            <AppIcon name="menu" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <View>
            <StoryRail />
            <View style={styles.searchWrap}>
              <AppIcon name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search FeelMix"
                placeholderTextColor={colors.textMuted}
                editable={false}
              />
            </View>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />

      <MenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sep: {
    height: spacing.md,
  },
});
