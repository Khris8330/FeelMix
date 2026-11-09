import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import {
  acceptDmRequest,
  declineDmRequest,
  fetchConversations,
  fetchIncomingRequests,
  type ConversationPreview,
  type DmRequest,
} from '@/lib/messages';
import { formatRelativeTime } from '@/lib/posts';
import { initials } from '@/lib/profile';

export default function MessagesTabScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [requests, setRequests] = useState<DmRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, r] = await Promise.all([fetchConversations(), fetchIncomingRequests()]);
    setConversations(c);
    setRequests(r);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onAccept = async (id: string) => {
    setBusyId(id);
    const { conversationId, error } = await acceptDmRequest(id);
    setBusyId(null);
    if (error || !conversationId) return;
    setRequests((list) => list.filter((r) => r.id !== id));
    router.push(`/messages/${conversationId}`);
  };

  const onDecline = async (id: string) => {
    setBusyId(id);
    await declineDmRequest(id);
    setBusyId(null);
    setRequests((list) => list.filter((r) => r.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
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
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            requests.length ? (
              <View style={styles.requestsBlock}>
                <Text style={styles.section}>Message requests</Text>
                {requests.map((r) => {
                  const name = r.from_user.display_name || r.from_user.handle;
                  return (
                    <View key={r.id} style={styles.requestRow}>
                      <Pressable
                        style={styles.person}
                        onPress={() => router.push(`/user/${r.from_user.id}`)}
                      >
                        {r.from_user.avatar_url ? (
                          <Image
                            source={{ uri: r.from_user.avatar_url }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={[styles.avatar, styles.fallback]}>
                            <Text style={styles.initials}>{initials(name)}</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.name}>{name}</Text>
                          <Text style={styles.sub}>Wants to message you</Text>
                        </View>
                      </Pressable>
                      <View style={styles.reqActions}>
                        <Pressable
                          style={styles.acceptBtn}
                          disabled={busyId === r.id}
                          onPress={() => onAccept(r.id)}
                        >
                          <Text style={styles.acceptText}>Accept</Text>
                        </Pressable>
                        <Pressable
                          style={styles.declineBtn}
                          disabled={busyId === r.id}
                          onPress={() => onDecline(r.id)}
                        >
                          <Text style={styles.declineText}>Decline</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null
          }
          ListEmptyComponent={
            requests.length ? null : (
              <Text style={styles.empty}>
                No conversations yet. Open someone&apos;s profile and tap Message to request a chat.
              </Text>
            )
          }
          renderItem={({ item }) => {
            const name = item.other.display_name || item.other.handle;
            return (
              <Pressable
                style={styles.convRow}
                onPress={() => router.push(`/messages/${item.id}`)}
              >
                {item.other.avatar_url ? (
                  <Image source={{ uri: item.other.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.fallback]}>
                    <Text style={styles.initials}>{initials(name)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={styles.convTop}>
                    <Text style={styles.name}>{name}</Text>
                    {item.last_message_at ? (
                      <Text style={styles.time}>
                        {formatRelativeTime(item.last_message_at)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.last_body || 'Say hello'}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  title: { color: colors.text, fontWeight: '800', fontSize: 24 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  section: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestsBlock: { marginBottom: spacing.lg },
  requestRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.text, fontWeight: '800', fontSize: 14 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  reqActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  acceptText: { color: colors.white, fontWeight: '700' },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  declineText: { color: colors.text, fontWeight: '600' },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  convTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: { color: colors.textMuted, fontSize: 12 },
  preview: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    lineHeight: 20,
  },
});
