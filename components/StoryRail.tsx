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

  const hasOwn = stories.some((s) => s.is_own);
  const others = stories.filter((s) => !s.is_own);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {/* Your story — always first, tappable to add */}
      <Pressable
        style={styles.item}
        onPress={() => router.push('/add-story')}
      >
        <View style={styles.ringWrap}>
          <LinearGradient
            colors={hasOwn ? [colors.primary, colors.coral] : ['#3A3A4A', '#3A3A4A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}
          >
            <View style={styles.ringInner}>
              {me?.avatar_url ? (
                <Image source={{ uri: me.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>
                    {initials(me?.display_name || me?.handle || 'Y')}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
          <View style={styles.addBadge}>
            <AppIcon name="add" size={12} color={colors.white} />
          </View>
        </View>
        <Text style={styles.label} numberOfLines={1}>
          Your story
        </Text>
      </Pressable>

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
                    {story.author.avatar_url ? (
                      <Image
                        source={{ uri: story.author.avatar_url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={styles.avatarInitials}>{initials(name)}</Text>
                      </View>
                    )}
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
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
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
