import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing } from '@/constants/theme';
import { signOut } from '@/lib/session';
import { AppIcon } from './AppIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const ITEMS = [
  { id: 'search', label: 'Search', icon: 'search', href: '/search' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', href: '/settings' },
  { id: 'saved', label: 'Saved', icon: 'bookmark-outline', href: null },
  { id: 'help', label: 'Help and support', icon: 'help-outline', href: null },
] as const;

export function MenuSheet({ visible, onClose }: Props) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Menu</Text>
          <ScrollView>
            {ITEMS.map((item) => (
              <Pressable
                key={item.id}
                style={styles.row}
                onPress={() => {
                  onClose();
                  if (item.href) router.push(item.href as any);
                }}
              >
                <View style={styles.iconWrap}>
                  <AppIcon name={item.icon} size={20} color={colors.text} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <AppIcon name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
            <Pressable
              style={styles.row}
              onPress={async () => {
                await signOut();
                onClose();
                router.replace('/(auth)/login');
              }}
            >
              <View style={styles.iconWrap}>
                <AppIcon name="arrow-back" size={20} color={colors.danger} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.danger }]}>Log out</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '55%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
