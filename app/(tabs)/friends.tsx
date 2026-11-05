import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import {
  fetchFollowing,
  fetchSuggested,
  followUser,
  unfollowUser,
  type Person,
} from '@/lib/follows';
import { initials } from '@/lib/profile';

function PersonRow({
  person,
  actionLabel,
  onAction,
  busy,
}: {
  person: Person;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
}) {
  const router = useRouter();
  const name = person.display_name || person.handle;

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.person}
        onPress={() => router.push(`/user/${person.id}`)}
      >
        {person.avatar_url ? (
          <Image source={{ uri: person.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>{initials(name)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>@{person.handle}</Text>
        </View>
      </Pressable>
      <Pressable
        style={[styles.actionBtn, person.is_following && styles.actionBtnFollowing]}
        onPress={onAction}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <Text style={styles.actionText}>{actionLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

type Row =
  | { type: 'header'; title: string; id: string }
  | { type: 'user'; person: Person; id: string }
  | { type: 'empty'; id: string; message: string };

export default function FriendsScreen() {
  const [following, setFollowing] = useState<Person[]>([]);
  const [suggested, setSuggested] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [f, s] = await Promise.all([fetchFollowing(), fetchSuggested()]);
    setFollowing(f);
    setSuggested(s);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onFollow = async (id: string) => {
    setBusyId(id);
    const { error } = await followUser(id);
    setBusyId(null);
    if (error) return;
    const person = suggested.find((p) => p.id === id);
    if (person) {
      setSuggested((list) => list.filter((p) => p.id !== id));
      setFollowing((list) => [...list, { ...person, is_following: true }]);
    }
  };

  const onUnfollow = async (id: string) => {
    setBusyId(id);
    const { error } = await unfollowUser(id);
    setBusyId(null);
    if (error) return;
    const person = following.find((p) => p.id === id);
    if (person) {
      setFollowing((list) => list.filter((p) => p.id !== id));
      setSuggested((list) => [...list, { ...person, is_following: false }]);
    }
  };

  const rows: Row[] = [
    { type: 'header', title: 'Following', id: 'h1' },
    ...(following.length
      ? following.map((p) => ({ type: 'user' as const, person: p, id: p.id }))
      : [{ type: 'empty' as const, id: 'e1', message: 'You are not following anyone yet.' }]),
    { type: 'header', title: 'Suggested', id: 'h2' },
    ...(suggested.length
      ? suggested.map((p) => ({ type: 'user' as const, person: p, id: p.id }))
      : [{ type: 'empty' as const, id: 'e2', message: 'No suggestions right now.' }]),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.sub}>Follow people. Message after they accept.</Text>
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.section}>{item.title}</Text>;
            }
            if (item.type === 'empty') {
              return <Text style={styles.empty}>{item.message}</Text>;
            }
            const person = item.person;
            return (
              <PersonRow
                person={person}
                actionLabel={person.is_following ? 'Following' : 'Follow'}
                busy={busyId === person.id}
                onAction={() =>
                  person.is_following ? onUnfollow(person.id) : onFollow(person.id)
                }
              />
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  section: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  row: {
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
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  handle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  actionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    minWidth: 96,
    alignItems: 'center',
  },
  actionBtnFollowing: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { color: colors.text, fontWeight: '600', fontSize: 13 },
});
