import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { resendSignupOtp, verifyEmailOtp } from '@/lib/session';
import { AppIcon } from '@/components/AppIcon';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params.email || '').toString();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onVerify = async () => {
    setError(null);
    setInfo(null);
    const token = code.replace(/\s/g, '');
    if (!email) {
      setError('Missing email. Go back and sign up again.');
      return;
    }
    if (token.length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    const { data, error: verifyError } = await verifyEmailOtp(email, token);
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    if (data.session) {
      router.replace('/(tabs)');
      return;
    }
    setInfo('Email confirmed. You can log in now.');
    router.replace('/(auth)/login');
  };

  const onResend = async () => {
    setError(null);
    setInfo(null);
    if (!email) return;
    setResending(true);
    const { error: resendError } = await resendSignupOtp(email);
    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setInfo('A new code was sent to your email.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <AppIcon name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Enter confirmation code</Text>
          <Text style={styles.sub}>
            We sent a 6-digit code to{" "}
            <Text style={styles.email}>{email || 'your email'}</Text>.
            Enter it below. You can ignore the link in the email.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={8}
            value={code}
            onChangeText={setCode}
            autoFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={onVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>Verify and continue</Text>
            )}
          </Pressable>

          <Pressable onPress={onResend} disabled={resending} style={styles.resend}>
            <Text style={styles.resendText}>
              {resending ? 'Sending…' : 'Resend code'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.resend}>
            <Text style={styles.loginLink}>Already confirmed? Log in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
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
  email: {
    color: colors.text,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  info: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  resend: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  loginLink: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
