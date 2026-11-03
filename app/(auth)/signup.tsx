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
import { AppIcon } from '@/components/AppIcon';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onCreate = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
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
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.legal}>
              By tapping Sign up, you agree to Krimie Terms and Privacy Policy.
            </Text>

            <Pressable style={styles.signupBtn} onPress={onCreate}>
              <Text style={styles.signupBtnText}>Sign up</Text>
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
  signupBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signupBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
