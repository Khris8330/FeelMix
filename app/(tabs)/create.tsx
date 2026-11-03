import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { fetchMyProfile, initials, type Profile } from '@/lib/profile';
import { createPost } from '@/lib/posts';

export default function CreateScreen() {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [me, setMe] = useState<Profile | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchMyProfile().then(setMe);
  }, []);

  const publish = async () => {
    if (!body.trim()) {
      Alert.alert('Add something', 'Write a thought before posting.');
      return;
    }
    setPosting(true);
    const { error } = await createPost(body);
    setPosting(false);
    if (error) {
      Alert.alert('Could not post', error.message);
      return;
    }
    setBody('');
    router.replace('/(tabs)');
  };

  const name = me?.display_name || me?.handle || 'You';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} disabled={posting}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Create post</Text>
          <Pressable
            onPress={publish}
            style={[styles.postBtn, posting && styles.postBtnDisabled]}
            disabled={posting}
          >
            {posting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.composer}>
          <View style={styles.userRow}>
            {me?.avatar_url ? (
              <Image source={{ uri: me.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarLetter}>{initials(name)}</Text>
              </View>
            )}
            <Text style={styles.name}>{name}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="What is on your mind?"
            placeholderTextColor={colors.textMuted}
            multiline
            value={body}
            onChangeText={setBody}
            autoFocus
            editable={!posting}
          />
        </View>

        <View style={styles.tools}>
          <Pressable style={styles.tool} onPress={() => router.push('/mood')}>
            <AppIcon name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.toolLabel}>Add a vibe</Text>
          </Pressable>
          <Pressable style={styles.tool}>
            <AppIcon name="image-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.toolLabel}>Photo</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { color: colors.textSecondary, fontSize: 15 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  postBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.7 },
  postBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  composer: {
    padding: spacing.xl,
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  input: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  tools: {
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
