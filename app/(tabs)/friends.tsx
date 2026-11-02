import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { getFollowers, getSuggested, type User } from '@/data/mock';

function PersonRow({
  user,
  actionLabel,
  onAction,
}: {
  user: User;
  actionLabel: string;
  onAction: () => void;
}) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.person}
        onPress={() => router.push(`/user/${user.id}`)}
      >
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.handle}>@{user.handle}</Text>
        </View>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={onAction}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function FriendsScreen() {
  const [following, setFollowing] = useState(getFollowers());
  const [suggested, setSuggested] = useState(getSuggested());

  const unfollow = (id: string) => {
    const user = following.find((u) => u.id === id);
    if (!user) return;
    setFollowing((list) => list.filter((u) => u.id !== id));
    setSuggested((list) => [...list, { ...user, isFollowing: false }]);
  };

  const follow = (id: string) => {
    const user = suggested.find((u) => u.id === id);
    if (!user) return;
    setSuggested((list) => list.filter((u) => u.id !== id));
    setFollowing((list) => [...list, { ...user, isFollowing: true }]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.sub}>Follow people. Message after they accept.</Text>
      </View>

      <FlatList
        data={[
          { type: 'header', title: 'Following', id: 'h1' },
          ...following.map((u) => ({ type: 'user' as const, user: u, id: u.id })),
          { type: 'header', title: 'Suggested', id: 'h2' },
          ...suggested.map((u) => ({ type: 'user' as const, user: u, id: u.id })),
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.section}>{item.title}</Text>;
          }
          const isFollowing = following.some((u) => u.id === item.user!.id);
          return (
            <PersonRow
              user={item.user!}
              actionLabel={isFollowing ? 'Following' : 'Follow'}
              onAction={() =>
                isFollowing ? unfollow(item.user!.id) : follow(item.user!.id)
              }
            />
          );
        }}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  handle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  actionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { color: colors.text, fontWeight: '600', fontSize: 13 },
});
