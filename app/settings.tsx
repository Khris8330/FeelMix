import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { fetchMyProfile, updateMyProfile, type Profile } from '@/lib/profile';
import { signOut } from '@/lib/session';
import { safeGoBack } from '@/lib/navigation';

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  right,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <View style={[styles.iconWrap, danger && styles.iconDanger]}>
        <AppIcon
          name={icon as any}
          size={20}
          color={danger ? colors.danger : colors.text}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>
          {label}
        </Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {right
        ? right
        : onPress
          ? <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
          : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowMessageRequests, setAllowMessageRequests] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await fetchMyProfile();
        setProfile(p);
        if (p) {
          setPrivateAccount(!!p.is_private);
          setAllowMessageRequests(p.allow_message_requests !== false);
        }
        setLoading(false);
      })();
    }, [])
  );

  const savePrivacy = async (
    key: 'is_private' | 'allow_message_requests',
    value: boolean
  ) => {
    setSavingKey(key);
    const { error, data } = await updateMyProfile({ [key]: value });
    setSavingKey(null);
    if (error) {
      Alert.alert('Could not save', error.message);
      if (key === 'is_private') setPrivateAccount(!value);
      else setAllowMessageRequests(!value);
      return;
    }
    if (data) setProfile(data);
  };

  const onTogglePrivate = (value: boolean) => {
    setPrivateAccount(value);
    savePrivacy('is_private', value);
  };

  const onToggleMessageRequests = (value: boolean) => {
    setAllowMessageRequests(value);
    savePrivacy('allow_message_requests', value);
  };

  const onLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    router.replace('/(auth)/login');
  };

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Krimie?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout },
    ]);
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

  const name = profile?.display_name || profile?.handle || 'You';

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
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Account</Text>
        <View style={styles.card}>
          <Row
            icon="person-outline"
            label="Edit profile"
            value={name}
            onPress={() => router.push('/edit-profile')}
          />
          <Row
            icon="at-outline"
            label="Username"
            value={profile?.handle ? `@${profile.handle}` : undefined}
            onPress={() => router.push('/edit-profile')}
          />
        </View>

        <Text style={styles.section}>Privacy</Text>
        <View style={styles.card}>
          <Row
            icon="lock-closed-outline"
            label="Private account"
            value="Only people you follow back can see your posts in their feed"
            right={
              savingKey === 'is_private' ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Switch
                  value={privateAccount}
                  onValueChange={onTogglePrivate}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              )
            }
          />
          <Row
            icon="chatbubble-outline"
            label="Message requests"
            value="Allow others to request a chat"
            right={
              savingKey === 'allow_message_requests' ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Switch
                  value={allowMessageRequests}
                  onValueChange={onToggleMessageRequests}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              )
            }
          />
        </View>

        <Text style={styles.section}>Support</Text>
        <View style={styles.card}>
          <Row
            icon="help-outline"
            label="Help and support"
            onPress={() =>
              Alert.alert(
                'Help',
                'For now, message the Krimie team from your usual channel. In-app help is coming soon.'
              )
            }
          />
          <Row
            icon="information-circle-outline"
            label="About Krimie"
            value="Version 1.0"
            onPress={() =>
              Alert.alert(
                'Krimie',
                'Moods, media, and the people who get it.\n\nVersion 1.0'
              )
            }
          />
        </View>

        <View style={[styles.card, { marginTop: spacing.xl }]}>
          <Pressable
            style={styles.logoutRow}
            onPress={confirmLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <>
                <AppIcon name="log-out-outline" size={20} color={colors.danger} />
                <Text style={styles.logoutText}>Log out</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>Krimie · feel-mix.vercel.app</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDanger: {
    backgroundColor: 'rgba(248,113,113,0.12)',
  },
  rowLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    fontSize: 12,
  },
});
