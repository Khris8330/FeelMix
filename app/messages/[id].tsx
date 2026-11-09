import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import {
  fetchMessages,
  getConversationOther,
  sendMessage,
  type ChatMessage,
} from '@/lib/messages';
import { initials } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [other, setOther] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [o, msgs] = await Promise.all([getConversationOther(id), fetchMessages(id)]);
    setOther(o);
    setMessages(msgs);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new as any;
          setMessages((list) => {
            if (list.some((m) => m.id === row.id)) return list;
            return [
              ...list,
              {
                id: row.id,
                body: row.body,
                sender_id: row.sender_id,
                created_at: row.created_at,
                read_at: row.read_at,
                mine: false,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const onSend = async () => {
    if (!id || !text.trim() || sending) return;
    setSending(true);
    const body = text;
    setText('');
    const { data, error } = await sendMessage(id, body);
    setSending(false);
    if (error || !data) {
      setText(body);
      return;
    }
    setMessages((list) => (list.some((m) => m.id === data.id) ? list : [...list, data]));
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const name = other?.display_name || other?.handle || 'Chat';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <AppIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          style={styles.headerPerson}
          onPress={() => other?.id && router.push(`/user/${other.id}`)}
        >
          {other?.avatar_url ? (
            <Image source={{ uri: other.avatar_url }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.fallback]}>
              <Text style={styles.initials}>{initials(name)}</Text>
            </View>
          )}
          <Text style={styles.headerName}>{name}</Text>
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.boot}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.empty}>No messages yet. Say hello.</Text>
            }
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.bubbleText, item.mine && styles.mineText]}>
                  {item.body}
                </Text>
              </View>
            )}
          />

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Message"
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={2000}
            />
            <Pressable
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendDisabled]}
              onPress={onSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <AppIcon name="send" size={18} color={colors.white} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerPerson: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
  },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.text, fontWeight: '800', fontSize: 11 },
  headerName: { color: colors.text, fontWeight: '700', fontSize: 16 },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 20 },
  mineText: { color: colors.white },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
});
