import { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';

type Props = {
  urls: string[];
  height?: number;
};

const { width: SCREEN_W } = Dimensions.get('window');

export function PostImages({ urls, height = 240 }: Props) {
  const [index, setIndex] = useState(0);
  const list = urls.filter(Boolean);
  if (!list.length) return null;

  // Card has horizontal padding ~ spacing.lg * 2 inside list + card padding
  const slideWidth = Math.min(SCREEN_W - 48, 420);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / slideWidth);
    if (i !== index && i >= 0 && i < list.length) setIndex(i);
  };

  if (list.length === 1) {
    return (
      <Image source={{ uri: list[0] }} style={[styles.single, { height }]} />
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ height }}
      >
        {list.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            source={{ uri: url }}
            style={{ width: slideWidth, height, borderRadius: radii.lg }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {list.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {index + 1}/{list.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  single: {
    width: '100%',
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
