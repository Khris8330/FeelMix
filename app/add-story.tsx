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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { createImageStory, createTextStory, uploadStoryImage } from '@/lib/stories';

const BG_COLORS = [
  '#FF3D8A',
  '#7C3AED',
  '#2563EB',
  '#059669',
  '#D97706',
  '#DC2626',
  '#0F172A',
  '#DB2777',
  '#0891B2',
  '#4F46E5',
];

type Mode = 'photo' | 'text';

export default function AddStoryScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('photo');
  const [preview, setPreview] = useState<string | null>(null);
  const [mime, setMime] = useState('image/jpeg');
  const [caption, setCaption] = useState('');
  const [text, setText] = useState('');
  const [bg, setBg] = useState(BG_COLORS[0]);
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
    setMode('photo');
  };

  const publish = async () => {
    setBusy(true);
    try {
      if (mode === 'text') {
        if (!text.trim()) {
          Alert.alert('Write something', 'Add text for your story.');
          setBusy(false);
          return;
        }
        const { error } = await createTextStory(text, bg);
        if (error) {
          Alert.alert('Could not post story', error.message);
          setBusy(false);
          return;
        }
        router.replace('/(tabs)');
        return;
      }

      if (!preview) {
        Alert.alert('Pick a photo', 'Choose an image for your story.');
        setBusy(false);
        return;
      }
      const { error: upError, url } = await uploadStoryImage({
        uri: preview,
        type: mime,
      });
      if (upError || !url) {
        Alert.alert('Upload failed', upError?.message || 'Try again');
        setBusy(false);
        return;
      }
      const { error } = await createImageStory(url, caption.trim() || undefined);
      if (error) {
        Alert.alert('Could not post story', error.message);
        setBusy(false);
        return;
      }
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
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

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, mode === 'photo' && styles.tabActive]}
          onPress={() => setMode('photo')}
        >
          <Text style={[styles.tabText, mode === 'photo' && styles.tabTextActive]}>Photo</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, mode === 'text' && styles.tabActive]}
          onPress={() => setMode('text')}
        >
          <Text style={[styles.tabText, mode === 'text' && styles.tabTextActive]}>Text</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {mode === 'photo' ? (
          <>
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
          </>
        ) : (
          <>
            <View style={[styles.textCanvas, { backgroundColor: bg }]}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your story..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                multiline
                value={text}
                onChangeText={setText}
                maxLength={220}
                textAlign="center"
              />
            </View>
            <Text style={styles.colorLabel}>Background</Text>
            <View style={styles.swatches}>
              {BG_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setBg(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    bg === c && styles.swatchActive,
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: colors.white },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  textCanvas: {
    height: 360,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  textInput: {
    width: '100%',
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
  },
  colorLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: '#fff',
  },
});
