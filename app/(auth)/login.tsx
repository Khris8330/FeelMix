import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { signIn } from '@/lib/session';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    // V1 mock auth: accept any non-empty credentials
    if (!email.trim() || !password.trim()) return;
    signIn();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Text style={styles.brand}>krimie</Text>
            <Text style={styles.tagline}>
              Moods, music, movies, and the people who get it.
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Mobile number or email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable style={styles.loginBtn} onPress={onLogin}>
              <Text style={styles.loginBtnText}>Log in</Text>
            </Pressable>

            <Pressable style={styles.forgotWrap}>
              <Text style={styles.forgot}>Forgotten password?</Text>
            </Pressable>
          </View>

          <View style={styles.bottom}>
            <Pressable
              style={styles.createBtn}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.createBtnText}>Create new account</Text>
            </Pressable>
            <Text style={styles.footer}>Krimie</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: 72,
    marginBottom: spacing.xxl,
  },
  brand: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1.5,
  },
  tagline: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  card: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  forgotWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  forgot: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  bottom: {
    marginTop: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.xl,
  },
  createBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xxl,
    minWidth: 220,
    alignItems: 'center',
  },
  createBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
