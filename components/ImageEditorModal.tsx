import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from './AppIcon';

type Props = {
  visible: boolean;
  uri: string;
  onClose: () => void;
  onSave: (uri: string) => void;
};

const TEXT_COLORS = ['#FFFFFF', '#FF3D8A', '#FBBF24', '#34D399', '#60A5FA', '#000000'];

export function ImageEditorModal({ visible, uri, onClose, onSave }: Props) {
  const [workingUri, setWorkingUri] = useState(uri);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setWorkingUri(uri);
    setText('');
    setTextColor('#FFFFFF');
  };

  const rotate = async () => {
    setBusy(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ rotate: 90 }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setWorkingUri(result.uri);
    } catch (e) {
      console.warn(e);
    }
    setBusy(false);
  };

  const cropSquare = async () => {
    setBusy(true);
    try {
      // Load dimensions via Image.getSize
      await new Promise<void>((resolve) => {
        Image.getSize(
          workingUri,
          async (width, height) => {
            const side = Math.min(width, height);
            const originX = Math.floor((width - side) / 2);
            const originY = Math.floor((height - side) / 2);
            try {
              const result = await ImageManipulator.manipulateAsync(
                workingUri,
                [{ crop: { originX, originY, width: side, height: side } }],
                { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
              );
              setWorkingUri(result.uri);
            } catch (err) {
              console.warn(err);
            }
            resolve();
          },
          () => resolve()
        );
      });
    } finally {
      setBusy(false);
    }
  };

  const applyText = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('load failed'));
          img.src = workingUri;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no canvas');
        ctx.drawImage(img, 0, 0);
        const fontSize = Math.max(24, Math.floor(canvas.width / 18));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = textColor;
        ctx.strokeStyle = textColor === '#000000' ? '#FFFFFF' : '#000000';
        ctx.lineWidth = Math.max(2, fontSize / 12);
        ctx.textAlign = 'center';
        const x = canvas.width / 2;
        const y = canvas.height - fontSize * 1.5;
        ctx.strokeText(text.trim(), x, y);
        ctx.fillText(text.trim(), x, y);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setWorkingUri(dataUrl);
        setText('');
      } else {
        // Native fallback: bake via manipulator is limited; keep text as caption note
        // User can still crop/rotate on native
      }
    } catch (e) {
      console.warn(e);
    }
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Edit photo</Text>
          <Pressable
            onPress={() => onSave(workingUri)}
            disabled={busy}
          >
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.previewWrap}>
          {busy ? (
            <ActivityIndicator color={colors.primary} style={StyleSheet.absoluteFill} />
          ) : null}
          <Image source={{ uri: workingUri }} style={styles.preview} resizeMode="contain" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tools}>
          <Pressable style={styles.tool} onPress={cropSquare} disabled={busy}>
            <Text style={styles.toolText}>Crop square</Text>
          </Pressable>
          <Pressable style={styles.tool} onPress={rotate} disabled={busy}>
            <Text style={styles.toolText}>Rotate</Text>
          </Pressable>
          <Pressable style={styles.tool} onPress={reset} disabled={busy}>
            <Text style={styles.toolText}>Reset</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.textRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Write on photo..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
          />
          <Pressable style={styles.addTextBtn} onPress={applyText} disabled={busy || !text.trim()}>
            <Text style={styles.addTextLabel}>Add</Text>
          </Pressable>
        </View>
        <View style={styles.colors}>
          {TEXT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setTextColor(c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                textColor === c && styles.swatchActive,
              ]}
            />
          ))}
        </View>
        {Platform.OS !== 'web' ? (
          <Text style={styles.hint}>
            Text on photo works best on web for now. Crop and rotate work everywhere.
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancel: { color: colors.textSecondary, fontSize: 15 },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  done: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  previewWrap: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  preview: { width: '100%', height: '100%' },
  tools: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tool: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  toolText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
  },
  addTextBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  addTextLabel: { color: colors.white, fontWeight: '700' },
  colors: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  swatchActive: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
});
