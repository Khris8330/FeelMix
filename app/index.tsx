import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { isAuthed } from '@/lib/session';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthed()) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [router]);

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
