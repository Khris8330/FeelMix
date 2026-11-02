import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

type Props = {
  name: string;
  size?: number;
  color?: string;
};

/** Facebook-style outline / filled icons rendered as SVG (works on web without font files). */
export function AppIcon({ name, size = 22, color = '#F5F5F7' }: Props) {
  const s = size;
  const stroke = 1.8;

  switch (name) {
    case 'home':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 3.5L3.5 11h2v8.5h5v-5h3v5h5V11h2L12 3.5z" />
        </Svg>
      );
    case 'home-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
          <Path d="M4 11.5L12 4l8 7.5" />
          <Path d="M6.5 10.5V19.5h4v-5h3v5h4V10.5" />
        </Svg>
      );
    case 'compass':
    case 'compass-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M14.5 9.5l-1.5 5-5 1.5 1.5-5 5-1.5z" fill={color} stroke="none" />
        </Svg>
      );
    case 'add':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </Svg>
      );
    case 'people':
    case 'people-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
          <Circle cx="9" cy="8" r="3.2" />
          <Path d="M3.5 19c0-3 2.4-5 5.5-5s5.5 2 5.5 5" />
          <Circle cx="17" cy="9" r="2.5" />
          <Path d="M16 14.2c2.2.4 4 2.1 4 4.8" />
        </Svg>
      );
    case 'person':
    case 'person-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}>
          <Circle cx="12" cy="8" r="3.5" />
          <Path d="M5 19.5c0-3.5 3-6 7-6s7 2.5 7 6" />
        </Svg>
      );
    case 'search':
    case 'search-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
          <Circle cx="11" cy="11" r="6.5" />
          <Line x1="16" y1="16" x2="20.5" y2="20.5" />
        </Svg>
      );
    case 'notifications':
    case 'notifications-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M6 16.5h12l-1.2-2V10a4.8 4.8 0 10-9.6 0v4.5L6 16.5z" />
          <Path d="M10 18.5a2 2 0 004 0" />
        </Svg>
      );
    case 'sparkles':
    case 'sparkles-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 3l1.2 5.2L18.5 9.5l-5.3 1.3L12 16l-1.2-5.2L5.5 9.5l5.3-1.3L12 3z" />
          <Path d="M18 14l.6 2.2 2.2.6-2.2.6L18 19.6l-.6-2.2-2.2-.6 2.2-.6L18 14z" />
        </Svg>
      );
    case 'heart':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 20.5s-7-4.4-7-9.2A4.3 4.3 0 0112 7.5a4.3 4.3 0 017 3.8c0 4.8-7 9.2-7 9.2z" />
        </Svg>
      );
    case 'heart-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
          <Path d="M12 20.5s-7-4.4-7-9.2A4.3 4.3 0 0112 7.5a4.3 4.3 0 017 3.8c0 4.8-7 9.2-7 9.2z" />
        </Svg>
      );
    case 'chatbubble-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
          <Path d="M5 5.5h14a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H9l-4 3v-3H5A1.5 1.5 0 013.5 15V7A1.5 1.5 0 015 5.5z" />
        </Svg>
      );
    case 'arrow-redo-outline':
    case 'share-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M4 14v3.5A2.5 2.5 0 006.5 20h11a2.5 2.5 0 002.5-2.5V14" />
          <Path d="M12 4v11" />
          <Path d="M8 8l4-4 4 4" />
        </Svg>
      );
    case 'repost':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M7 7h9.5a3 3 0 013 3v2" />
          <Path d="M10 4L7 7l3 3" />
          <Path d="M17 17H7.5a3 3 0 01-3-3v-2" />
          <Path d="M14 20l3-3-3-3" />
        </Svg>
      );
    case 'ellipsis-horizontal':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <Circle cx="6" cy="12" r="1.6" />
          <Circle cx="12" cy="12" r="1.6" />
          <Circle cx="18" cy="12" r="1.6" />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
          <Line x1="6" y1="6" x2="18" y2="18" />
          <Line x1="18" y1="6" x2="6" y2="18" />
        </Svg>
      );
    case 'arrow-back':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Line x1="19" y1="12" x2="5" y2="12" />
          <Path d="M11 6l-6 6 6 6" />
        </Svg>
      );
    case 'settings-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 3.5v2.2M12 18.3v2.2M4.9 7.1l1.6 1.6M17.5 15.3l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 16.9l1.6-1.6M17.5 8.7l1.6-1.6" />
        </Svg>
      );
    case 'musical-notes':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
          <Path d="M9 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <Path d="M9 13V6.5l10-2V15" />
          <Path d="M19 17a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        </Svg>
      );
    case 'film-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
          <Rect x="3.5" y="5" width="17" height="14" rx="1.5" />
          <Line x1="8" y1="5" x2="8" y2="19" />
          <Line x1="16" y1="5" x2="16" y2="19" />
          <Line x1="3.5" y1="9" x2="8" y2="9" />
          <Line x1="3.5" y1="15" x2="8" y2="15" />
          <Line x1="16" y1="9" x2="20.5" y2="9" />
          <Line x1="16" y1="15" x2="20.5" y2="15" />
        </Svg>
      );
    case 'checkmark-circle':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <Circle cx="12" cy="12" r="9" />
          <Path d="M8.5 12.2l2.3 2.3 4.7-4.8" fill="none" stroke="#0B0B12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'chevron-forward':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M9 6l6 6-6 6" />
        </Svg>
      );
    case 'image-outline':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
          <Rect x="3.5" y="5" width="17" height="14" rx="1.5" />
          <Circle cx="9" cy="10" r="1.6" />
          <Path d="M3.5 16.5l4.5-4 3.5 3 3-2.5 6 3.5" />
        </Svg>
      );
    default:
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
  }
}
