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
import { AppIcon } from '@/components/AppIcon';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationCopy,
  type AppNotification,
} from '@/lib/notifications';
import { formatRelativeTime } from '@/lib/posts';
import { initials } from '@/lib/profile';
import { safeGoBack } from '@/lib/navigation';

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchNotifications();
    setItems(list);
    setLoading(false);
    setRefreshing(false);
    await markAllNotificationsRead();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const open = async (n: AppNotification) => {
    await markNotificationRead(n.id);
    if (n.type === 'dm_request') {
      router.push('/(tabs)/messages');
      return;
    }
    if (n.type === 'follow' && n.actor?.id) {
      router.push(`/user/${n.actor.id}`);
      return;
    }
    if (n.post_id) {
      router.push(`/post/${n.post_id}`);
    }
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
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
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
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet.</Text>
          }
          renderItem={({ item }) => {
            const name = item.actor?.display_name || item.actor?.handle || '?';
            const unread = !item.read_at;
            return (
              <Pressable
                style={[styles.row, unread && styles.rowUnread]}
                onPress={() => open(item)}
              >
                {item.actor?.avatar_url ? (
                  <Image source={{ uri: item.actor.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.fallback]}>
                    <Text style={styles.initials}>{initials(name)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.copy}>{notificationCopy(item)}</Text>
                  <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
                </View>
                {unread ? <View style={styles.dot} /> : null}
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
    justifyContent: 'space-between',
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
  title: { color: colors.text, fontWeight: '800', fontSize: 18 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowUnread: {
    borderColor: 'rgba(255,61,138,0.35)',
    backgroundColor: 'rgba(255,61,138,0.06)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.text, fontWeight: '800', fontSize: 13 },
  copy: { color: colors.text, fontSize: 14, fontWeight: '600' },
  time: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
