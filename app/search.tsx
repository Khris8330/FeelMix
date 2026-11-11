import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import {
  searchPeople,
  searchPosts,
  type SearchPerson,
  type SearchPost,
} from '@/lib/search';
import { followUser, unfollowUser } from '@/lib/follows';
import { formatRelativeTime } from '@/lib/posts';
import { initials } from '@/lib/profile';
import { safeGoBack } from '@/lib/navigation';

type Tab = 'people' | 'posts';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('people');
  const [people, setPeople] = useState<SearchPerson[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setPeople([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const t = setTimeout(async () => {
      if (tab === 'people') {
        const list = await searchPeople(q);
        setPeople(list);
      } else {
        const list = await searchPosts(q);
        setPosts(list);
      }
      setLoading(false);
    }, 280);

    return () => clearTimeout(t);
  }, [query, tab]);

  const toggleFollow = async (person: SearchPerson) => {
    setBusyId(person.id);
    if (person.is_following) {
      await unfollowUser(person.id);
      setPeople((list) =>
        list.map((p) => (p.id === person.id ? { ...p, is_following: false } : p))
      );
    } else {
      await followUser(person.id);
      setPeople((list) =>
        list.map((p) => (p.id === person.id ? { ...p, is_following: true } : p))
      );
    }
    setBusyId(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => safeGoBack(router)}
          hitSlop={16}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.inputWrap}>
          <AppIcon name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search people or posts"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <AppIcon name="close" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.tabs}>
        {(['people', 'posts'] as Tab[]).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabActive]}>
              {t === 'people' ? 'People' : 'Posts'}
            </Text>
            {tab === t ? <View style={styles.tabLine} /> : null}
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : tab === 'people' ? (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query.trim()
                ? 'No people matched that search.'
                : 'Search by name or handle.'}
            </Text>
          }
          renderItem={({ item }) => {
            const name = item.display_name || item.handle;
            return (
              <View style={styles.personRow}>
                <Pressable
                  style={styles.person}
                  onPress={() => router.push(`/user/${item.id}`)}
                >
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.fallback]}>
                      <Text style={styles.initials}>{initials(name)}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.handle}>@{item.handle}</Text>
                    {item.bio ? (
                      <Text style={styles.bio} numberOfLines={1}>
                        {item.bio}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
                <Pressable
                  style={[styles.followBtn, item.is_following && styles.followingBtn]}
                  onPress={() => toggleFollow(item)}
                  disabled={busyId === item.id}
                >
                  {busyId === item.id ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Text style={styles.followText}>
                      {item.is_following ? 'Following' : 'Follow'}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query.trim() ? 'No posts matched that search.' : 'Search post text.'}
            </Text>
          }
          renderItem={({ item }) => {
            const name = item.author.display_name || item.author.handle || 'Someone';
            return (
              <Pressable
                style={styles.postRow}
                onPress={() => router.push(`/post/${item.id}`)}
              >
                {item.author.avatar_url ? (
                  <Image source={{ uri: item.author.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.fallback]}>
                    <Text style={styles.initials}>{initials(name)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {name}{' '}
                    <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
                  </Text>
                  <Text style={styles.postBody} numberOfLines={3}>
                    {item.body}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    padding: 0,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.text, fontWeight: '800', fontSize: 13 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  handle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  bio: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
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
  postRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  time: { color: colors.textMuted, fontWeight: '500', fontSize: 12 },
  postBody: { color: colors.textSecondary, fontSize: 14, marginTop: 4, lineHeight: 20 },
});
