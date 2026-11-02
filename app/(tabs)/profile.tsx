import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@/constants/theme';
import { currentUser, getPostsByUser } from '@/data/mock';
import { PostCard } from '@/components/PostCard';

type Tab = 'posts' | 'vibes' | 'about';

export default function ProfileScreen() {
  const [tab, setTab] = useState<Tab>('posts');
  const userPosts = getPostsByUser(currentUser.id);
  const allMine = getPostsByUser(currentUser.id);
  // Demo: show feed posts attributed to others as sample content on profile vibes
  const vibePosts = allMine.filter((p) => p.vibe);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Profile</Text>
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </View>

        <View style={styles.hero}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.handle}>@{currentUser.handle}</Text>
          <Text style={styles.bio}>{currentUser.bio}</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{currentUser.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{currentUser.followersCount}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{currentUser.vibesCount}</Text>
              <Text style={styles.statLabel}>Vibes</Text>
            </View>
          </View>

          <Pressable style={styles.editBtn}>
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(['posts', 'vibes', 'about'] as Tab[]).map((t) => (
            <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {tab === t ? <View style={styles.tabLine} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.tabBody}>
          {tab === 'posts' &&
            (userPosts.length ? (
              userPosts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <Text style={styles.empty}>
                Your posts will show up here. Share something from Create.
              </Text>
            ))}
          {tab === 'vibes' &&
            (vibePosts.length ? (
              vibePosts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <Text style={styles.empty}>
                Shared vibes will appear here after you post a mood mix.
              </Text>
            ))}
          {tab === 'about' && (
            <View style={styles.about}>
              <Text style={styles.aboutLabel}>Bio</Text>
              <Text style={styles.aboutValue}>{currentUser.bio}</Text>
              <Text style={styles.aboutLabel}>Handle</Text>
              <Text style={styles.aboutValue}>@{currentUser.handle}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  handle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  bio: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xxxl,
    marginTop: spacing.xl,
  },
  stat: { alignItems: 'center' },
  statNum: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  editBtn: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  tabActive: { color: colors.primary },
  tabLine: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '40%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tabBody: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 20,
  },
  about: { gap: spacing.sm },
  aboutLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  aboutValue: { color: colors.text, fontSize: 15 },
});
