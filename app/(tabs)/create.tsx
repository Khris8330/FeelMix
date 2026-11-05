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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { fetchMyProfile, initials, type Profile } from '@/lib/profile';
import { createPost } from '@/lib/posts';
import { uploadPostImage } from '@/lib/media';

export default function CreateScreen() {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [me, setMe] = useState<Profile | null>(null);
  const [posting, setPosting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/jpeg');

  useEffect(() => {
    fetchMyProfile().then(setMe);
  }, []);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted && Platform.OS !== 'web') {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setImageUri(result.assets[0].uri);
    setImageMime(result.assets[0].mimeType || 'image/jpeg');
  };

  const publish = async () => {
    if (!body.trim() && !imageUri) {
      Alert.alert('Add something', 'Write a thought or add a photo.');
      return;
    }
    setPosting(true);

    let imageUrl: string | null = null;
    if (imageUri) {
      const { error: upError, url } = await uploadPostImage({
        uri: imageUri,
        type: imageMime,
      });
      if (upError || !url) {
        setPosting(false);
        Alert.alert('Photo upload failed', upError?.message || 'Try again');
        return;
      }
      imageUrl = url;
    }

    const { error } = await createPost(body.trim() || ' ', imageUrl);
    setPosting(false);
    if (error) {
      Alert.alert('Could not post', error.message);
      return;
    }
    setBody('');
    setImageUri(null);
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

        <ScrollView style={styles.composer} keyboardShouldPersistTaps="handled">
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
          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              <Pressable
                style={styles.removePhoto}
                onPress={() => setImageUri(null)}
                disabled={posting}
              >
                <AppIcon name="close" size={16} color={colors.white} />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.tools}>
          <Pressable style={styles.tool} onPress={() => router.push('/mood')} disabled={posting}>
            <AppIcon name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.toolLabel}>Add a vibe</Text>
          </Pressable>
          <Pressable style={styles.tool} onPress={pickPhoto} disabled={posting}>
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  previewWrap: {
    marginTop: spacing.lg,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  removePhoto: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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
