import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { supabase } from '@/lib/supabase';
import { markStoryViewed } from '@/lib/stories';

const { height } = Dimensions.get('window');

export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('image');
  const [caption, setCaption] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#000');
  const [vibe, setVibe] = useState<any>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('stories')
        .select(
          `media_url, media_type, caption, bg_color, vibe_json, profiles!stories_author_id_fkey ( display_name, handle )`
        )
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setMediaUrl(data.media_url);
        setMediaType(data.media_type || 'image');
        setCaption(data.caption);
        setBgColor(data.bg_color || '#000');
        setVibe(data.vibe_json);
        const p = (data as any).profiles;
        setName(p?.display_name || p?.handle || '');
        await markStoryViewed(id);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <SafeAreaView style={[styles.safe, mediaType === 'text' && { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <AppIcon name="close" size={22} color={colors.white} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : mediaType === 'text' ? (
        <Pressable style={styles.center} onPress={() => router.back()}>
          <Text style={styles.textStory}>{caption}</Text>
        </Pressable>
      ) : mediaType === 'vibe' ? (
        <Pressable style={styles.center} onPress={() => router.back()}>
          {mediaUrl ? (
            <Image source={{ uri: mediaUrl }} style={styles.image} resizeMode="cover" />
          ) : null}
          <View style={styles.vibeCard}>
            <Text style={styles.vibeMood}>{vibe?.moodTitle || caption}</Text>
            {vibe?.trackName ? (
              <Text style={styles.vibeLine}>
                ♪ {vibe.trackName}
                {vibe.trackArtist ? ` · ${vibe.trackArtist}` : ''}
              </Text>
            ) : null}
            {vibe?.movieTitle ? (
              <Text style={styles.vibeLine}>
                ♫ {vibe.movieTitle}
                {vibe.movieYear ? ` (${vibe.movieYear})` : ''}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ) : mediaUrl ? (
        <Pressable style={styles.center} onPress={() => router.back()}>
          <Image source={{ uri: mediaUrl }} style={styles.image} resizeMode="contain" />
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </Pressable>
      ) : (
        <View style={styles.center}>
          <Text style={styles.missing}>Story not found or expired.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  name: { color: colors.white, fontWeight: '700', fontSize: 15 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  image: {
    width: '100%',
    height: height * 0.65,
    borderRadius: radii.lg,
  },
  caption: {
    color: colors.white,
    marginTop: spacing.lg,
    fontSize: 15,
    textAlign: 'center',
  },
  textStory: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    paddingHorizontal: spacing.xl,
  },
  vibeCard: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  vibeMood: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  vibeLine: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 6,
  },
  missing: { color: colors.textMuted },
});
