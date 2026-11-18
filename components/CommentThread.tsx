import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { formatRelativeTime, type CommentItem } from '@/lib/posts';
import { initials } from '@/lib/profile';
import { EmptyState } from './EmptyState';
import { Bone } from './Skeleton';

type Props = {
  comments: CommentItem[];
  loading?: boolean;
  sending?: boolean;
  onSend: (text: string) => Promise<void> | void;
  /** When true, renders as a fixed bottom composer + list (detail page). */
  embedded?: boolean;
};

function CommentSkeleton() {
  return (
    <View style={{ gap: spacing.md, paddingVertical: spacing.md }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.row}>
          <Bone width={36} height={36} radius={18} />
          <View style={{ flex: 1, gap: 6 }}>
            <Bone width="35%" height={11} />
            <Bone width="88%" height={12} />
            <Bone width="22%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CommentThread({
  comments,
  loading,
  sending,
  onSend,
  embedded = true,
}: Props) {
  const [text, setText] = useState('');

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    await onSend(value);
  };

  const list = (
    <>
      {loading ? (
        <CommentSkeleton />
      ) : comments.length === 0 ? (
        <EmptyState
          icon="chatbubble-outline"
          title="No comments yet"
          subtitle="Be the first to share your thoughts."
        />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          scrollEnabled={!embedded}
          style={embedded ? undefined : { maxHeight: 340 }}
          contentContainerStyle={embedded ? { paddingBottom: spacing.lg } : undefined}
          renderItem={({ item }) => {
            const name = item.author.display_name || item.author.handle || '?';
            return (
              <View style={styles.row}>
                {item.author.avatar_url ? (
                  <Image source={{ uri: item.author.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.fallback]}>
                    <Text style={styles.initials}>{initials(name)}</Text>
                  </View>
                )}
                <View style={styles.bubble}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </>
  );

  const composer = (
    <View style={styles.composer}>
      <TextInput
        style={styles.input}
        placeholder="Write a comment..."
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        editable={!sending}
        onSubmitEditing={submit}
        returnKeyType="send"
      />
      <Pressable
        style={[styles.send, (!text.trim() || sending) && styles.sendDisabled]}
        onPress={submit}
        disabled={!text.trim() || !!sending}
      >
        {sending ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.sendText}>Post</Text>
        )}
      </Pressable>
    </View>
  );

  if (!embedded) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {list}
        {composer}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{list}</View>
      {composer}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.text, fontSize: 12, fontWeight: '800' },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontWeight: '700', fontSize: 13 },
  body: { color: colors.textSecondary, fontSize: 14, marginTop: 3, lineHeight: 20 },
  time: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
  },
  send: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: colors.white, fontWeight: '700' },
});
