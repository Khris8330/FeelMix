import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';
import { ProfileSkeleton } from '@/components/Skeleton';
import { fetchMyProfile, initials, type Profile } from '@/lib/profile';
import { fetchPostsByAuthor, type FeedPost } from '@/lib/posts';
import {
  fetchFollowers,
  fetchFollowing,
  followUser,
  unfollowUser,
  type Person,
} from '@/lib/follows';

type Tab = 'posts' | 'vibes' | 'about' | 'people';

function PersonRow({
  person,
  onToggle,
  busy,
}: {
  person: Person;
  onToggle: () => void;
  busy?: boolean;
}) {
  const router = useRouter();
  const name = person.display_name || person.handle;

  return (
    <View style={styles.personRow}>
      <Pressable style={styles.person} onPress={() => router.push(`/user/${person.id}`)}>
        {person.avatar_url ? (
          <Image source={{ uri: person.avatar_url }} style={styles.personAvatar} />
        ) : (
          <View style={[styles.personAvatar, styles.avatarFallback]}>
            <Text style={styles.personInitials}>{initials(name)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.personName}>{name}</Text>
          <Text style={styles.personHandle}>@{person.handle}</Text>
        </View>
      </Pressable>
      <Pressable
        style={[styles.followBtn, person.is_following && styles.followingBtn]}
        onPress={onToggle}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <Text style={styles.followText}>
            {person.is_following ? 'Following' : 'Follow'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const [tab, setTab] = useState<Tab>('posts');
  const [peoplePage, setPeoplePage] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
  const [followers, setFollowers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = await fetchMyProfile();
    setProfile(p);
    if (p) {
      const [list, fwing, fwers] = await Promise.all([
        fetchPostsByAuthor(p.id),
        fetchFollowing(),
        fetchFollowers(),
      ]);
      setPosts(list);
      setFollowing(fwing);
      setFollowers(fwers);
    } else {
      setPosts([]);
      setFollowing([]);
      setFollowers([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openPeople = (page: 0 | 1) => {
    setTab('people');
    setPeoplePage(page);
    requestAnimationFrame(() => {
      pagerRef.current?.scrollTo({ x: page * width, animated: false });
    });
  };

  const onPeopleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1));
    setPeoplePage(page);
  };

  const toggleFollow = async (person: Person) => {
    setBusyId(person.id);
    if (person.is_following) {
      await unfollowUser(person.id);
      setFollowing((items) => items.filter((p) => p.id !== person.id));
      setFollowers((items) =>
        items.map((p) => (p.id === person.id ? { ...p, is_following: false } : p))
      );
    } else {
      await followUser(person.id);
      const updated = { ...person, is_following: true };
      setFollowers((items) =>
        items.map((p) => (p.id === person.id ? updated : p))
      );
      setFollowing((items) =>
        items.some((p) => p.id === person.id) ? items : [...items, updated]
      );
    }
    setBusyId(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Profile</Text>
          <View style={{ width: 22 }} />
        </View>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="person-outline"
          title="Could not load profile"
          subtitle="Pull to refresh or try signing in again."
          actionLabel="Retry"
          onAction={() => {
            setLoading(true);
            load();
          }}
        />
      </SafeAreaView>
    );
  }

  const name = profile.display_name || profile.handle;
  const avatar = profile.avatar_url;
  const vibePosts = posts.filter((p) => p.vibe);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>Profile</Text>
          <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
            <AppIcon name="settings-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{initials(name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{profile.handle}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.stats}>
            <Pressable style={styles.stat} onPress={() => setTab('posts')}>
              <Text style={styles.statNum}>{profile.posts_count}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </Pressable>
            <Pressable style={styles.stat} onPress={() => openPeople(1)}>
              <Text style={styles.statNum}>{profile.followers_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </Pressable>
            <Pressable style={styles.stat} onPress={() => openPeople(0)}>
              <Text style={styles.statNum}>{profile.following_count}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.editBtn}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(
            [
              ['posts', 'Posts'],
              ['people', 'People'],
              ['vibes', 'Vibes'],
              ['about', 'About'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={styles.tab}
              onPress={() => {
                if (key === 'people') openPeople(peoplePage as 0 | 1);
                else setTab(key);
              }}
            >
              <Text style={[styles.tabText, tab === key && styles.tabActive]}>
                {label}
              </Text>
              {tab === key ? <View style={styles.tabLine} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.tabBody}>
          {tab === 'posts' &&
            (posts.length ? (
              posts.map((p) => (
                <View key={p.id} style={styles.postWrap}>
                  <PostCard post={p} />
                </View>
              ))
            ) : (
              <EmptyState
                icon="image-outline"
                title="No posts yet"
                subtitle="Share a thought, photo, or vibe and it will land here."
                actionLabel="Create a post"
                onAction={() => router.push('/(tabs)/create')}
              />
            ))}

          {tab === 'people' && (
            <View>
              <View style={styles.peopleTabs}>
                <Pressable style={styles.peopleTab} onPress={() => openPeople(0)}>
                  <Text
                    style={[
                      styles.peopleTabText,
                      peoplePage === 0 && styles.peopleTabActive,
                    ]}
                  >
                    Following
                  </Text>
                  {peoplePage === 0 ? <View style={styles.peopleLine} /> : null}
                </Pressable>
                <Pressable style={styles.peopleTab} onPress={() => openPeople(1)}>
                  <Text
                    style={[
                      styles.peopleTabText,
                      peoplePage === 1 && styles.peopleTabActive,
                    ]}
                  >
                    Followers
                  </Text>
                  {peoplePage === 1 ? <View style={styles.peopleLine} /> : null}
                </Pressable>
              </View>

              <ScrollView
                ref={pagerRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onPeopleScroll}
                style={{ width }}
              >
                <View style={{ width }}>
                  {following.length ? (
                    <View style={{ paddingHorizontal: spacing.lg }}>
                      {following.map((p) => (
                        <PersonRow
                          key={p.id}
                          person={p}
                          busy={busyId === p.id}
                          onToggle={() => toggleFollow(p)}
                        />
                      ))}
                    </View>
                  ) : (
                    <EmptyState
                      icon="people-outline"
                      title="Not following anyone"
                      subtitle="Find people on Discover or Search and follow them."
                      actionLabel="Search people"
                      onAction={() => router.push('/search')}
                    />
                  )}
                </View>
                <View style={{ width }}>
                  {followers.length ? (
                    <View style={{ paddingHorizontal: spacing.lg }}>
                      {followers.map((p) => (
                        <PersonRow
                          key={p.id}
                          person={p}
                          busy={busyId === p.id}
                          onToggle={() => toggleFollow(p)}
                        />
                      ))}
                    </View>
                  ) : (
                    <EmptyState
                      icon="people-outline"
                      title="No followers yet"
                      subtitle="When people follow you, they will show up here."
                    />
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {tab === 'vibes' &&
            (vibePosts.length ? (
              vibePosts.map((p) => (
                <View key={p.id} style={styles.postWrap}>
                  <PostCard post={p} />
                </View>
              ))
            ) : (
              <EmptyState
                icon="musical-notes"
                title="No vibes yet"
                subtitle="Post a Mood Mix and your vibe cards will collect here."
                actionLabel="Open Mood Mix"
                onAction={() => router.push('/mood')}
              />
            ))}

          {tab === 'about' && (
            <View style={styles.about}>
              <Text style={styles.aboutLabel}>Bio</Text>
              <Text style={styles.aboutValue}>
                {profile.bio || 'No bio yet.'}
              </Text>
              <Text style={styles.aboutLabel}>Handle</Text>
              <Text style={styles.aboutValue}>@{profile.handle}</Text>
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
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
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
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  postWrap: { marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  about: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  aboutLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  aboutValue: { color: colors.text, fontSize: 15 },
  peopleTabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  peopleTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  peopleTabText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  peopleTabActive: { color: colors.primary },
  peopleLine: {
    marginTop: 6,
    height: 2,
    width: 40,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  person: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
  },
  personInitials: { color: colors.text, fontSize: 13, fontWeight: '800' },
  personName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  personHandle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  followBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    minWidth: 96,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: { color: colors.text, fontWeight: '600', fontSize: 13 },
});
