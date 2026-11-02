import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/constants/theme';
import { stories, getUser, currentUser } from '@/data/mock';
import { AppIcon } from './AppIcon';

export function StoryRail() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {stories.map((story) => {
        const user = story.isOwn ? currentUser : getUser(story.userId);
        if (!user) return null;
        const ringColors = story.seen
          ? (['#3A3A4A', '#3A3A4A'] as const)
          : ([colors.primary, colors.coral] as const);

        return (
          <Pressable key={story.id} style={styles.item}>
            <View style={styles.ringWrap}>
              <LinearGradient
                colors={[...ringColors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ring}
              >
                <View style={styles.ringInner}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                </View>
              </LinearGradient>
              {story.isOwn ? (
                <View style={styles.addBadge}>
                  <AppIcon name="add" size={12} color={colors.white} />
                </View>
              ) : null}
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {story.isOwn ? 'Your story' : user.name.split(' ')[0]}
            </Text>
          </Pressable>
        );
      })}
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
