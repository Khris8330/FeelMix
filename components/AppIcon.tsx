import { Text, StyleSheet, Platform, type StyleProp, type TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** Map common ionicon names to emoji for reliable web rendering. */
const WEB_ICONS: Record<string, string> = {
  home: '🏠',
  'home-outline': '🏠',
  compass: '🧭',
  'compass-outline': '🧭',
  add: '＋',
  people: '👥',
  'people-outline': '👥',
  person: '👤',
  'person-outline': '👤',
  search: '🔍',
  'search-outline': '🔍',
  notifications: '🔔',
  'notifications-outline': '🔔',
  sparkles: '✨',
  'sparkles-outline': '✨',
  heart: '♥',
  'heart-outline': '♡',
  'chatbubble-outline': '💬',
  'arrow-redo-outline': '↗',
  'ellipsis-horizontal': '•••',
  close: '✕',
  'arrow-back': '←',
  'settings-outline': '⚙',
  'musical-notes': '🎵',
  'film-outline': '🎬',
  'share-outline': '↗',
  'image-outline': '🖼',
  'checkmark-circle': '✓',
  chevron-forward: '›',
};

type Props = {
  name: keyof typeof WEB_ICONS | string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppIcon({ name, size = 22, color = '#F5F5F7', style }: Props) {
  if (Platform.OS === 'web') {
    const glyph = WEB_ICONS[name] ?? '•';
    return (
      <Text
        style={[
          styles.web,
          { fontSize: size * 0.92, lineHeight: size, color },
          style,
        ]}
        allowFontScaling={false}
      >
        {glyph}
      </Text>
    );
  }

  return (
    <Ionicons
      name={name as keyof typeof Ionicons.glyphMap}
      size={size}
      color={color}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  web: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
