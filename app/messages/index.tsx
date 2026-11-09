import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';

/** Legacy route: send users to the Messages tab. */
export default function MessagesIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/messages');
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
