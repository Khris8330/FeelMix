import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { PostCard } from '@/components/PostCard';
import { fetchProfileById, initials, type PublicProfile } from '@/lib/profile';
import { fetchPostsByAuthor, type FeedPost } from '@/lib/posts';
import { followUser, unfollowUser } from '@/lib/follows';
import { getDmStatus, requestDm } from '@/lib/messages';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dmBusy, setDmBusy] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [dmLabel, setDmLabel] = useState('Message');
  const [dmStatus, setDmStatus] = useState<
    'none' | 'pending_out' | 'pending_in' | 'accepted' | 'declined'
  >('none');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [requestId, setRequestId] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!id) return;
    const p = await fetchProfileById(id);
    setProfile(p);
    if (p) {
      setFollowing(p.is_following);
      setFollowersCount(p.followers_count);
      const list = await fetchPostsByAuthor(p.id);
      setPosts(list);
      if (!p.is_own) {
        const st = await getDmStatus(p.id);
        setDmStatus(st.status);
        setConversationId(st.conversationId);
        setRequestId(st.requestId);
        if (st.status === 'accepted') setDmLabel('Message');
        else if (st.status === 'pending_out') setDmLabel('Requested');
        else if (st.status === 'pending_in') setDmLabel('Respond');
        else if (st.status === 'declined') setDmLabel('Message');
        else setDmLabel('Message');
      }
    } else {
      setPosts([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleFollow = async () => {
    if (!profile || profile.is_own) return;
    setBusy(true);
    if (following) {
      const { error } = await unfollowUser(profile.id);
      setBusy(false);
      if (error) {
        Alert.alert('Could not unfollow', error.message);
        return;
      }
      setFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } else {
      const { error } = await followUser(profile.id);
      setBusy(false);
      if (error) {
        Alert.alert('Could not follow', error.message);
        return;
      }
      setFollowing(true);
      setFollowersCount((c) => c + 1);
    }
  };

  const onMessage = async () => {
    if (!profile || profile.is_own) return;

    if (dmStatus === 'accepted' && conversationId) {
      router.push(`/messages/${conversationId}`);
      return;
    }

    if (dmStatus === 'pending_in') {
      router.push('/messages');
      return;
    }

    if (dmStatus === 'pending_out') {
      Alert.alert('Request pending', 'They still need to accept your message request.');
      return;
    }

    if (!following) {
      Alert.alert(
        'Follow first',
        'Follow this person, then request a direct message. They must accept before you can chat.'
      );
      return;
    }

    setDmBusy(true);
    const { error } = await requestDm(profile.id);
    setDmBusy(false);
    if (error) {
      Alert.alert('Could not send request', error.message);
      return;
    }
    setDmStatus('pending_out');
    setDmLabel('Requested');
    Alert.alert(
      'Request sent',
      'They will need to accept before you can send direct messages.'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <AppIcon name="close" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Profile</Text>
          <View style={{ width: 22 }} />
        </View>
        <Text style={styles.empty}>User not found.</Text>
      </SafeAreaView>
    );
  }

  const name = profile.display_name || profile.handle;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <AppIcon name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>{initials(name)}</Text>
          </View>
        )}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.handle}>@{profile.handle}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.posts_count}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{profile.following_count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {!profile.is_own ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, following && styles.btnOutline]}
              onPress={toggleFollow}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={following ? colors.text : colors.white} />
              ) : (
                <Text style={[styles.btnText, following && styles.btnTextOutline]}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              )}
            </Pressable>
            <Pressable style={styles.btnOutline} onPress={onMessage} disabled={dmBusy}>
              {dmBusy ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.btnTextOutline}>{dmLabel}</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.btnOutline, { marginTop: spacing.xl }]}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.btnTextOutline}>Edit profile</Text>
          </Pressable>
        )}

        <Text style={styles.section}>Posts</Text>
        {posts.length ? (
          posts.map((p) => (
            <View key={p.id} style={styles.postWrap}>
              <PostCard post={p} />
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No posts yet from this person.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    backgroundColor: colors.surface,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: colors.text, fontSize: 28, fontWeight: '800' },
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
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    minWidth: 120,
    alignItems: 'center',
  },
  btnOutline: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 120,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700' },
  btnTextOutline: { color: colors.text, fontWeight: '700' },
  section: {
    alignSelf: 'flex-start',
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  postWrap: { width: '100%', marginBottom: spacing.md },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
