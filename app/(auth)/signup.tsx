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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { signUp } from '@/lib/session';
import { AppIcon } from '@/components/AppIcon';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    setError(null);
    setInfo(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { data, error: authError } = await signUp(
      email.trim(),
      password,
      name.trim()
    );
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    // If email confirmation is required, session may be null.
    if (data.session) {
      router.replace('/(tabs)');
    } else {
      setInfo('Check your email to confirm your account, then log in.');
    }
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
          <Pressable style={styles.back} onPress={() => router.back()}>
            <AppIcon name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.sub}>
            Join Krimie to share moods, music, and movies with people who get it.
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile number or email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.legal}>
              By tapping Sign up, you agree to Krimie Terms and Privacy Policy.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}

            <Pressable
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={onCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.signupBtnText}>Sign up</Text>
              )}
            </Pressable>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  form: {
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
  legal: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  info: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signupBtnDisabled: {
    opacity: 0.7,
  },
  signupBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
