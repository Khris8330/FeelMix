import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { colors } from '@/constants/theme';
import { getSession } from '@/lib/session';
import LoginScreen from './(auth)/login';

export default function Index() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!navState?.key) return;

    let active = true;
    (async () => {
      const session = await getSession();
      if (!active) return;
      if (session) {
        setAuthed(true);
        router.replace('/(tabs)');
      } else {
        setAuthed(false);
      }
      setChecking(false);
    })();

    return () => {
      active = false;
    };
  }, [navState?.key, router]);

  if (checking || authed) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
