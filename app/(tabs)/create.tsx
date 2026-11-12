import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
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
import { ImageEditorModal } from '@/components/ImageEditorModal';
import { fetchMyProfile, initials, type Profile } from '@/lib/profile';
import { createPost } from '@/lib/posts';
import { uploadManyPostImages } from '@/lib/media';
import { safeGoBack } from '@/lib/navigation';
import { showError, showToast } from '@/lib/toast';

type LocalImage = {
  id: string;
  uri: string;
  type?: string;
};

const MAX_IMAGES = 10;

export default function CreateScreen() {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [me, setMe] = useState<Profile | null>(null);
  const [posting, setPosting] = useState(false);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyProfile().then(setMe);
  }, []);

  const pickPhoto = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      showToast('Limit reached', `You can add up to ${MAX_IMAGES} photos.`);
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted && Platform.OS !== 'web') {
      showError('Allow photo access to attach images.', 'Permission needed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });

    if (result.canceled || !result.assets?.length) return;

    const next: LocalImage[] = result.assets.map((a, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      uri: a.uri,
      type: a.mimeType || 'image/jpeg',
    }));
    setImages((prev) => [...prev, ...next].slice(0, MAX_IMAGES));
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const publish = async () => {
    if (!body.trim() && !images.length) {
      showToast('Add something', 'Write a thought or add a photo.');
      return;
    }
    setPosting(true);

    let urls: string[] = [];
    if (images.length) {
      const { urls: uploaded, error: upError } = await uploadManyPostImages(
        images.map((img) => ({ uri: img.uri, type: img.type }))
      );
      if (upError || !uploaded.length) {
        setPosting(false);
        showError(upError?.message || 'Try again', 'Photo upload failed');
        return;
      }
      urls = uploaded;
    }

    const { error } = await createPost(body.trim(), urls);
    setPosting(false);
    if (error) {
      showError(error.message, 'Could not post');
      return;
    }
    setBody('');
    setImages([]);
    showToast('Posted');
    router.replace('/(tabs)');
  };

  const name = me?.display_name || me?.handle || 'You';
  const editing = images.find((img) => img.id === editId) || null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => safeGoBack(router)} disabled={posting}>
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

          {images.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gallery}
            >
              {images.map((img) => (
                <View key={img.id} style={styles.thumbWrap}>
                  <Pressable onPress={() => setEditId(img.id)}>
                    <Image source={{ uri: img.uri }} style={styles.thumb} />
                    <View style={styles.editBadge}>
                      <Text style={styles.editBadgeText}>Edit</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={styles.removePhoto}
                    onPress={() => removeImage(img.id)}
                    disabled={posting}
                  >
                    <AppIcon name="close" size={14} color={colors.white} />
                  </Pressable>
                </View>
              ))}
              {images.length < MAX_IMAGES ? (
                <Pressable style={styles.addMore} onPress={pickPhoto} disabled={posting}>
                  <AppIcon name="add" size={22} color={colors.primary} />
                  <Text style={styles.addMoreText}>Add</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : null}
        </ScrollView>

        <View style={styles.tools}>
          <Pressable style={styles.tool} onPress={() => router.push('/mood')} disabled={posting}>
            <AppIcon name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.toolLabel}>Add a vibe</Text>
          </Pressable>
          <Pressable style={styles.tool} onPress={pickPhoto} disabled={posting}>
            <AppIcon name="image-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.toolLabel}>
              Photo{images.length ? ` (${images.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {editing ? (
        <ImageEditorModal
          visible
          uri={editing.uri}
          onClose={() => setEditId(null)}
          onSave={(uri) => {
            setImages((prev) =>
              prev.map((img) => (img.id === editing.id ? { ...img, uri } : img))
            );
            setEditId(null);
          }}
        />
      ) : null}
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  gallery: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  thumbWrap: {
    position: 'relative',
    width: 140,
    height: 140,
  },
  thumb: {
    width: 140,
    height: 140,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  editBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  editBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMore: {
    width: 140,
    height: 140,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  addMoreText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
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
