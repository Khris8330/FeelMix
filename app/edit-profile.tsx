import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii, spacing } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { EditProfileSkeleton } from '@/components/Skeleton';
import {
  fetchMyProfile,
  initials,
  STATUS_EMOJIS,
  updateMyProfile,
  uploadAvatar,
  validateBio,
  validateDisplayName,
  validateHandle,
  type Profile,
} from '@/lib/profile';
import { safeGoBack } from '@/lib/navigation';
import { showToast } from '@/lib/toast';

export default function EditProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [statusEmoji, setStatusEmoji] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchMyProfile();
        if (p) {
          setProfile(p);
          setName(p.display_name || '');
          setHandle(p.handle || '');
          setBio(p.bio || '');
          setStatusEmoji(p.status_emoji || null);
          setAvatarUrl(p.avatar_url);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickPhoto = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted && Platform.OS !== 'web') {
      setError('Photo library permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.55,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    const { error: upError, url } = await uploadAvatar({
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || 'avatar.jpg',
    });
    setUploading(false);

    if (upError) {
      const msg = upError.message || 'Upload failed';
      if (/maximum allowed size/i.test(msg)) {
        setError('Photo is too large. Try a smaller image or crop tighter.');
      } else {
        setError(msg);
      }
      return;
    }
    if (url) {
      setAvatarUrl(url);
      showToast('Photo updated');
    }
  };

  const onSave = async () => {
    setError(null);
    const nameErr = validateDisplayName(name);
    if (nameErr) {
      setError(nameErr);
      return;
    }
    const handleErr = validateHandle(handle);
    if (handleErr) {
      setError(handleErr);
      return;
    }
    const bioErr = validateBio(bio);
    if (bioErr) {
      setError(bioErr);
      return;
    }

    const cleanHandle = handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    setSaving(true);
    const { error: saveError } = await updateMyProfile({
      display_name: name.trim(),
      handle: cleanHandle,
      bio: bio.trim() || null,
      status_emoji: statusEmoji,
    });
    setSaving(false);

    if (saveError) {
      const msg = saveError.message || 'Could not save';
      if (/duplicate|unique|handle/i.test(msg)) {
        setError('That handle is already taken.');
      } else {
        setError(msg);
      }
      return;
    }
    showToast('Profile saved');
    safeGoBack(router, '/(tabs)/profile');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <EditProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => safeGoBack(router, '/(tabs)/profile')} hitSlop={10}>
            <AppIcon name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Edit profile</Text>
          <Pressable onPress={onSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.save}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.avatarWrap} onPress={pickPhoto} disabled={uploading}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>
                  {initials(name || profile?.handle || 'K')}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <AppIcon name="camera" size={16} color={colors.white} />
              )}
            </View>
            {statusEmoji ? (
              <View style={styles.statusBadge}>
                <Text style={{ fontSize: 16 }}>{statusEmoji}</Text>
              </View>
            ) : null}
          </Pressable>
          <Text style={styles.changePhoto} onPress={pickPhoto}>
            {uploading ? 'Uploading…' : 'Change photo'}
          </Text>

          <Text style={styles.label}>Status</Text>
          <View style={styles.emojiRow}>
            <Pressable
              style={[styles.emojiChip, !statusEmoji && styles.emojiChipActive]}
              onPress={() => setStatusEmoji(null)}
            >
              <Text style={styles.emojiNone}>None</Text>
            </Pressable>
            {STATUS_EMOJIS.map((e) => (
              <Pressable
                key={e}
                style={[styles.emojiChip, statusEmoji === e && styles.emojiChipActive]}
                onPress={() => setStatusEmoji(e)}
              >
                <Text style={{ fontSize: 18 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textMuted}
            placeholder="Display name"
            maxLength={40}
          />
          <Text style={styles.hint}>{name.trim().length}/40</Text>

          <Text style={styles.label}>Handle</Text>
          <View style={styles.handleRow}>
            <Text style={styles.at}>@</Text>
            <TextInput
              style={[styles.input, styles.handleInput]}
              value={handle}
              onChangeText={(t) => setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.textMuted}
              placeholder="username"
              maxLength={20}
            />
          </View>
          <Text style={styles.hint}>{handle.length}/20 · letters, numbers, underscore</Text>

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholderTextColor={colors.textMuted}
            placeholder="Tell people about your vibes"
            maxLength={160}
          />
          <Text style={styles.hint}>{bio.length}/160</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  topTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  save: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  avatarWrap: {
    marginTop: spacing.md,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  statusBadge: {
    position: 'absolute',
    left: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  changePhoto: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    alignSelf: 'stretch',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  emojiRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.lg,
  },
  emojiChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,61,138,0.12)',
  },
  emojiNone: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  input: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  handleRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  at: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  handleInput: {
    flex: 1,
    marginBottom: 0,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    alignSelf: 'stretch',
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  error: {
    alignSelf: 'stretch',
    color: colors.danger || '#F87171',
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
