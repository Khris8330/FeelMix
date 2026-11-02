import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@/constants/theme';
import { getUser, getPostsByUser } from '@/data/mock';
import { PostCard } from '@/components/PostCard';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = getUser(id);
  const [following, setFollowing] = useState(user?.isFollowing ?? false);
  const [dmRequested, setDmRequested] = useState(false);
  const posts = user ? getPostsByUser(user.id) : [];

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>User not found.</Text>
      </SafeAreaView>
    );
  }

  const requestDm = () => {
    if (!following) {
      Alert.alert(
        'Follow first',
        'Follow this person, then request a direct message. They must accept before you can chat.'
      );
      return;
    }
    setDmRequested(true);
    Alert.alert(
      'Request sent',
      'They will need to accept before you can send direct messages. Until then you can reply on their posts.'
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{user.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.handle}>@{user.handle}</Text>
        <Text style={styles.bio}>{user.bio}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.followersCount}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.vibesCount}</Text>
            <Text style={styles.statLabel}>Vibes</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, following && styles.btnOutline]}
            onPress={() => setFollowing((v) => !v)}
          >
            <Text style={[styles.btnText, following && styles.btnTextOutline]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          <Pressable style={styles.btnOutline} onPress={requestDm}>
            <Text style={styles.btnTextOutline}>
              {dmRequested ? 'DM requested' : 'Message'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Posts</Text>
        {posts.length ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <Text style={styles.empty}>No posts yet from this person.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  btnOutline: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  btnText: { color: colors.white, fontWeight: '700' },
  btnTextOutline: { color: colors.text, fontWeight: '700' },
  section: {
    alignSelf: 'flex-start',
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
