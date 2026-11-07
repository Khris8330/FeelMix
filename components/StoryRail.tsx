import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { AppIcon } from './AppIcon';
import { fetchActiveStories, type StoryItem } from '@/lib/stories';
import { fetchMyProfile, initials, type Profile } from '@/lib/profile';

function StoryThumb({ story }: { story: StoryItem }) {
  if (story.media_type === 'text') {
    return (
      <View style={[styles.thumb, { backgroundColor: story.bg_color || colors.primary }]}>
        <Text style={styles.thumbText} numberOfLines={3}>
          {story.caption || 'Story'}
        </Text>
      </View>
    );
  }

  if (story.media_type === 'vibe') {
    if (story.media_url) {
      return <Image source={{ uri: story.media_url }} style={styles.thumb} />;
    }
    return (
      <View style={[styles.thumb, { backgroundColor: story.bg_color || '#1a1020' }]}>
        <Text style={styles.thumbEmoji}>🎵</Text>
      </View>
    );
  }

  if (story.media_url) {
    return <Image source={{ uri: story.media_url }} style={styles.thumb} />;
  }

  const name = story.author.display_name || story.author.handle || '?';
  if (story.author.avatar_url) {
    return <Image source={{ uri: story.author.avatar_url }} style={styles.thumb} />;
  }
  return (
    <View style={[styles.thumb, styles.avatarFallback]}>
      <Text style={styles.avatarInitials}>{initials(name)}</Text>
    </View>
  );
}

export function StoryRail() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [profile, list] = await Promise.all([
      fetchMyProfile(),
      fetchActiveStories(),
    ]);
    setMe(profile);
    setStories(list);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const ownStory = stories.find((s) => s.is_own) || null;
  const others = stories.filter((s) => !s.is_own);

  const openOwn = () => {
    if (ownStory) {
      router.push(`/story/${ownStory.id}`);
    } else {
      router.push('/add-story');
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <View style={styles.item}>
        <Pressable onPress={openOwn}>
          <View style={styles.ringWrap}>
            <LinearGradient
              colors={
                ownStory
                  ? [colors.primary, colors.coral]
                  : ['#3A3A4A', '#3A3A4A']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ring}
            >
              <View style={styles.ringInner}>
                {ownStory ? (
                  <StoryThumb story={ownStory} />
                ) : me?.avatar_url ? (
                  <Image source={{ uri: me.avatar_url }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.avatarFallback]}>
                    <Text style={styles.avatarInitials}>
                      {initials(me?.display_name || me?.handle || 'Y')}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            <Pressable
              style={styles.addBadge}
              onPress={(e) => {
                e.stopPropagation?.();
                router.push('/add-story');
              }}
              hitSlop={8}
            >
              <AppIcon name="add" size={12} color={colors.white} />
            </Pressable>
          </View>
        </Pressable>
        <Text style={styles.label} numberOfLines={1}>
          Your story
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      ) : (
        others.map((story) => {
          const ringColors = story.seen
            ? (['#3A3A4A', '#3A3A4A'] as const)
            : ([colors.primary, colors.coral] as const);
          const name = story.author.display_name || story.author.handle;

          return (
            <Pressable
              key={story.id}
              style={styles.item}
              onPress={() => router.push(`/story/${story.id}`)}
            >
              <View style={styles.ringWrap}>
                <LinearGradient
                  colors={[...ringColors]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ring}
                >
                  <View style={styles.ringInner}>
                    <StoryThumb story={story} />
                  </View>
                </LinearGradient>
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {name.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  item: {
    width: 72,
    alignItems: 'center',
  },
  loadingWrap: {
    width: 40,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    position: 'relative',
  },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 61,
    height: 61,
    borderRadius: 30.5,
    backgroundColor: colors.bg,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  thumbEmoji: { fontSize: 22 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  addBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  label: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    width: 72,
  },
});
