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
import { colors, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { supabase } from '@/lib/supabase';
import { markStoryViewed } from '@/lib/stories';

const { height } = Dimensions.get('window');

export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('stories')
        .select(
          `media_url, caption, profiles!stories_author_id_fkey ( display_name, handle )`
        )
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setUrl(data.media_url);
        setCaption(data.caption);
        const p = (data as any).profiles;
        setName(p?.display_name || p?.handle || '');
        await markStoryViewed(id);
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <SafeAreaView style={styles.safe}>
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
      ) : url ? (
        <Pressable style={styles.center} onPress={() => router.back()}>
          <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
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
    height: height * 0.7,
  },
  caption: {
    color: colors.white,
    marginTop: spacing.lg,
    fontSize: 15,
    textAlign: 'center',
  },
  missing: { color: colors.textMuted },
});
