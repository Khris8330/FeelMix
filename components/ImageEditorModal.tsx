import { useEffect, useState } from 'react';
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
  LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors, radii, spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  uri: string;
  onClose: () => void;
  onSave: (uri: string) => void;
};

const TEXT_COLORS = ['#FFFFFF', '#FF3D8A', '#FBBF24', '#34D399', '#60A5FA', '#000000'];
const MIN_CROP = 40;

export function ImageEditorModal({ visible, uri, onClose, onSave }: Props) {
  const [workingUri, setWorkingUri] = useState(uri);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'crop' | 'text'>('crop');
  const [box, setBox] = useState({ w: 300, h: 300 });
  const [natural, setNatural] = useState({ w: 1, h: 1 });

  const x = useSharedValue(40);
  const y = useSharedValue(40);
  const w = useSharedValue(220);
  const h = useSharedValue(220);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startW = useSharedValue(0);
  const startH = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setWorkingUri(uri);
      setText('');
      setMode('crop');
      Image.getSize(
        uri,
        (nw, nh) => setNatural({ w: nw, h: nh }),
        () => setNatural({ w: 1, h: 1 })
      );
    }
  }, [visible, uri]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
    const side = Math.min(width, height) * 0.75;
    x.value = (width - side) / 2;
    y.value = (height - side) / 2;
    w.value = side;
    h.value = side;
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(box.w - w.value, startX.value + e.translationX));
      const ny = Math.max(0, Math.min(box.h - h.value, startY.value + e.translationY));
      x.value = nx;
      y.value = ny;
    });

  const resize = Gesture.Pan()
    .onBegin(() => {
      startW.value = w.value;
      startH.value = h.value;
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((e) => {
      const nw = Math.max(MIN_CROP, Math.min(box.w - startX.value, startW.value + e.translationX));
      const nh = Math.max(MIN_CROP, Math.min(box.h - startY.value, startH.value + e.translationY));
      w.value = nw;
      h.value = nh;
    });

  const cropStyle = useAnimatedStyle(() => ({
    left: x.value,
    top: y.value,
    width: w.value,
    height: h.value,
  }));

  const applyCrop = async () => {
    setBusy(true);
    try {
      const scale = Math.min(box.w / natural.w, box.h / natural.h);
      const dispW = natural.w * scale;
      const dispH = natural.h * scale;
      const offX = (box.w - dispW) / 2;
      const offY = (box.h - dispH) / 2;

      const relX = Math.max(0, x.value - offX);
      const relY = Math.max(0, y.value - offY);
      const relW = Math.min(w.value, dispW - relX);
      const relH = Math.min(h.value, dispH - relY);

      const originX = Math.floor(relX / scale);
      const originY = Math.floor(relY / scale);
      const cropW = Math.max(1, Math.floor(relW / scale));
      const cropH = Math.max(1, Math.floor(relH / scale));

      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [
          {
            crop: {
              originX: Math.min(originX, natural.w - 1),
              originY: Math.min(originY, natural.h - 1),
              width: Math.min(cropW, natural.w - originX),
              height: Math.min(cropH, natural.h - originY),
            },
          },
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setWorkingUri(result.uri);
      Image.getSize(result.uri, (nw, nh) => setNatural({ w: nw, h: nh }));
    } catch (e) {
      console.warn(e);
    }
    setBusy(false);
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
      Image.getSize(result.uri, (nw, nh) => setNatural({ w: nw, h: nh }));
    } catch (e) {
      console.warn(e);
    }
    setBusy(false);
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
        ctx.strokeText(text.trim(), canvas.width / 2, canvas.height - fontSize * 1.5);
        ctx.fillText(text.trim(), canvas.width / 2, canvas.height - fontSize * 1.5);
        setWorkingUri(canvas.toDataURL('image/jpeg', 0.9));
        setText('');
      }
    } catch (e) {
      console.warn(e);
    }
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Edit photo</Text>
            <Pressable onPress={() => onSave(workingUri)} disabled={busy}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.previewWrap} onLayout={onLayout}>
            <Image source={{ uri: workingUri }} style={styles.preview} resizeMode="contain" />
            {mode === 'crop' ? (
              <GestureDetector gesture={pan}>
                <Animated.View style={[styles.cropBox, cropStyle]}>
                  <View style={styles.gridH} />
                  <View style={styles.gridV} />
                  <GestureDetector gesture={resize}>
                    <View style={styles.handleBR} />
                  </GestureDetector>
                  <View style={styles.handleTL} />
                  <View style={styles.handleTR} />
                  <View style={styles.handleBL} />
                </Animated.View>
              </GestureDetector>
            ) : null}
            {busy ? (
              <ActivityIndicator color={colors.primary} style={StyleSheet.absoluteFill} />
            ) : null}
          </View>

          <View style={styles.tools}>
            <Pressable
              style={[styles.tool, mode === 'crop' && styles.toolActive]}
              onPress={() => setMode('crop')}
            >
              <Text style={styles.toolText}>Crop</Text>
            </Pressable>
            {mode === 'crop' ? (
              <Pressable style={styles.toolPrimary} onPress={applyCrop} disabled={busy}>
                <Text style={styles.toolPrimaryText}>Apply</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.tool} onPress={rotate} disabled={busy}>
              <Text style={styles.toolText}>Rotate</Text>
            </Pressable>
            <Pressable
              style={[styles.tool, mode === 'text' && styles.toolActive]}
              onPress={() => setMode('text')}
            >
              <Text style={styles.toolText}>Text</Text>
            </Pressable>
          </View>

          {mode === 'text' ? (
            <>
              <View style={styles.textRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write on photo..."
                  placeholderTextColor={colors.textMuted}
                  value={text}
                  onChangeText={setText}
                />
                <Pressable
                  style={styles.addTextBtn}
                  onPress={applyText}
                  disabled={busy || !text.trim()}
                >
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
            </>
          ) : (
            <Text style={styles.hint}>
              Drag the box to move. Drag the pink corner to resize, then tap Apply.
            </Text>
          )}
        </View>
      </GestureHandlerRootView>
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
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  handleBR: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  handleTL: {
    position: 'absolute',
    left: -6,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  handleTR: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  handleBL: {
    position: 'absolute',
    left: -6,
    bottom: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tool: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,61,138,0.12)',
  },
  toolPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  toolText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  toolPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 13 },
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
