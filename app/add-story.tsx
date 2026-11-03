import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { createStory, uploadStoryImage } from '@/lib/stories';

export default function AddStoryScreen() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [mime, setMime] = useState('image/jpeg');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted && Platform.OS !== 'web') {
      Alert.alert('Permission needed', 'Allow photo access to add a story.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [9, 16],
    });
    if (result.canceled || !result.assets?.[0]) return;
    setPreview(result.assets[0].uri);
    setMime(result.assets[0].mimeType || 'image/jpeg');
  };

  const publish = async () => {
    if (!preview) {
      Alert.alert('Pick a photo', 'Choose an image for your story.');
      return;
    }
    setBusy(true);
    const { error: upError, url } = await uploadStoryImage({
      uri: preview,
      type: mime,
    });
    if (upError || !url) {
      setBusy(false);
      Alert.alert('Upload failed', upError?.message || 'Try again');
      return;
    }
    const { error } = await createStory(url, caption.trim() || undefined);
    setBusy(false);
    if (error) {
      Alert.alert('Could not post story', error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <AppIcon name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Add story</Text>
        <Pressable onPress={publish} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.share}>Share</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        {preview ? (
          <Image source={{ uri: preview }} style={styles.preview} />
        ) : (
          <Pressable style={styles.picker} onPress={pick}>
            <AppIcon name="camera" size={32} color={colors.primary} />
            <Text style={styles.pickerText}>Choose a photo</Text>
          </Pressable>
        )}

        {preview ? (
          <Pressable onPress={pick} style={styles.change}>
            <Text style={styles.changeText}>Change photo</Text>
          </Pressable>
        ) : null}

        <TextInput
          style={styles.caption}
          placeholder="Add a caption (optional)"
          placeholderTextColor={colors.textMuted}
          value={caption}
          onChangeText={setCaption}
        />
      </View>
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
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  share: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  picker: {
    height: 360,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pickerText: { color: colors.textSecondary, fontWeight: '600' },
  preview: {
    width: '100%',
    height: 360,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
  change: { marginTop: spacing.md, alignItems: 'center' },
  changeText: { color: colors.primary, fontWeight: '700' },
  caption: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
});
