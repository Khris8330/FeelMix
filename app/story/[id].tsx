import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import {
  fetchStoriesByAuthor,
  markStoryViewed,
  setStoryReaction,
  replyToStory,
  fetchStoryReactionSummary,
  STORY_REACTION_EMOJIS,
  type StoryItem,
} from '@/lib/stories';
import { showToast } from '@/lib/toast';

const { height, width } = Dimensions.get('window');

export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [index, setIndex] = useState(0);
  const [myEmoji, setMyEmoji] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [reacting, setReacting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('stories')
        .select('author_id')
        .eq('id', id)
        .maybeSingle();

      if (!data?.author_id) {
        setLoading(false);
        return;
      }

      const list = await fetchStoriesByAuthor(data.author_id);
      setStories(list);
      const start = Math.max(
        0,
        list.findIndex((s) => s.id === id)
      );
      setIndex(start === -1 ? 0 : start);
      setLoading(false);
    })();
  }, [id]);

  const current = stories[index] || null;

  useEffect(() => {
    if (!current?.id) return;
    markStoryViewed(current.id);
    fetchStoryReactionSummary(current.id).then((s) => setMyEmoji(s.myEmoji));
    setReply('');
  }, [current?.id]);

  const name = useMemo(() => {
    if (!current) return '';
    return current.author.display_name || current.author.handle || '';
  }, [current]);

  const goNext = () => {
    if (index < stories.length - 1) setIndex(index + 1);
    else router.back();
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
    else router.back();
  };

  const onReact = async (emoji: string) => {
    if (!current || reacting) return;
    setReacting(true);
    const next = myEmoji === emoji ? null : emoji;
    setMyEmoji(next);
    const { error } = await setStoryReaction(current.id, next);
    setReacting(false);
    if (error) {
      setMyEmoji(myEmoji);
      showToast('Could not react');
      return;
    }
    if (next) showToast(next);
  };

  const onReply = async () => {
    if (!current || !reply.trim() || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    const { error } = await replyToStory(current.id, text);
    setSending(false);
    if (error) {
      setReply(text);
      showToast('Could not send reply');
      return;
    }
    showToast('Reply sent');
  };

  const bg =
    current?.media_type === 'text'
      ? current.bg_color || '#000'
      : '#000';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {stories.length > 0 ? (
          <View style={styles.progressRow}>
            {stories.map((s, i) => (
              <View key={s.id} style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    i < index ? { width: '100%' } : null,
                    i === index ? { width: '100%', opacity: 1 } : null,
                    i > index ? { width: 0 } : null,
                  ]}
                />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.header}>
          <Text style={styles.name}>
            {name}
            {stories.length > 1 ? ` · ${index + 1}/${stories.length}` : ''}
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <AppIcon name="close" size={22} color={colors.white} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : !current ? (
          <View style={styles.center}>
            <Text style={styles.missing}>Story not found or expired.</Text>
          </View>
        ) : (
          <View style={styles.body}>
            <Pressable style={styles.tapLeft} onPress={goPrev} />
            <Pressable style={styles.tapRight} onPress={goNext} />

            {current.media_type === 'text' ? (
              <View style={styles.center}>
                <Text style={styles.textStory}>{current.caption}</Text>
              </View>
            ) : current.media_type === 'vibe' ? (
              <View style={styles.center}>
                {current.media_url ? (
                  <Image
                    source={{ uri: current.media_url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={styles.vibeCard}>
                  <Text style={styles.vibeMood}>
                    {current.vibe_json?.moodTitle || current.caption}
                  </Text>
                  {current.vibe_json?.trackName ? (
                    <Text style={styles.vibeLine}>
                      ♪ {current.vibe_json.trackName}
                      {current.vibe_json.trackArtist
                        ? ` · ${current.vibe_json.trackArtist}`
                        : ''}
                    </Text>
                  ) : null}
                  {current.vibe_json?.movieTitle ? (
                    <Text style={styles.vibeLine}>
                      ♫ {current.vibe_json.movieTitle}
                      {current.vibe_json.movieYear
                        ? ` (${current.vibe_json.movieYear})`
                        : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : current.media_url ? (
              <View style={styles.center}>
                <Image
                  source={{ uri: current.media_url }}
                  style={styles.image}
                  resizeMode="contain"
                />
                {current.caption ? (
                  <Text style={styles.caption}>{current.caption}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.center}>
                <Text style={styles.missing}>Story not found or expired.</Text>
              </View>
            )}

            {/* Reactions + reply (above tap zones via zIndex) */}
            <View style={styles.engage} pointerEvents="box-none">
              <View style={styles.reactRow}>
                {STORY_REACTION_EMOJIS.map((e) => (
                  <Pressable
                    key={e}
                    style={[styles.reactBtn, myEmoji === e && styles.reactBtnActive]}
                    onPress={() => onReact(e)}
                    disabled={reacting}
                  >
                    <Text style={styles.reactEmoji}>{e}</Text>
                  </Pressable>
                ))}
              </View>

              {!current.is_own ? (
                <View style={styles.replyRow}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Reply to story…"
                    placeholderTextColor="rgba(255,255,255,0.55)"
                    value={reply}
                    onChangeText={setReply}
                    maxLength={200}
                  />
                  <Pressable
                    style={[styles.replySend, (!reply.trim() || sending) && { opacity: 0.5 }]}
                    onPress={onReply}
                    disabled={!reply.trim() || sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <AppIcon name="send" size={16} color={colors.white} />
                    )}
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.ownHint}>Your story · reactions arrive as activity</Text>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  name: { color: colors.white, fontWeight: '700', fontSize: 15 },
  body: { flex: 1 },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 120,
    width: width * 0.3,
    zIndex: 5,
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 120,
    width: width * 0.7,
    zIndex: 5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: height * 0.55,
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
  engage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  reactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  reactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactBtnActive: {
    backgroundColor: 'rgba(255,61,138,0.35)',
  },
  reactEmoji: { fontSize: 22 },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
  },
  replySend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownHint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
