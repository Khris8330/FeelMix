import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/theme';
import { isAuthed } from '@/lib/session';
import LoginScreen from './(auth)/login';

export default function Index() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!navState?.key) return;
    setReady(true);
    if (isAuthed()) {
      router.replace('/(tabs)');
    }
  }, [navState?.key, router]);

  // Not authed: render login inline so we never depend on a redirect route.
  if (ready && !isAuthed()) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.boot}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
