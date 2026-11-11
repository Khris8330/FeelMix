import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const session = await getSession();
      if (!mounted) return;
      if (!session) {
        router.replace('/(auth)/login');
        return;
      }
      setAllowed(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/(auth)/login');
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  // Mobile Chrome often reports 0 inset but still covers the bottom of the page.
  // Keep generous padding so labels (Home, Discover, etc.) are fully visible.
  const bottomPad = Math.max(
    insets.bottom,
    isMobileWeb ? 42 : Platform.OS === 'web' ? 20 : 14
  );

  if (!allowed) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // Let padding define space; avoid fixed height clipping labels on web.
          height: undefined as unknown as number,
          minHeight: 56 + bottomPad,
          paddingTop: 6,
          paddingBottom: bottomPad,
          overflow: 'visible',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIcon,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'compass' : 'compass-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: () => (
            <View style={styles.createBtn}>
              <AppIcon name="add" size={28} color={colors.white} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2,
    marginBottom: 4,
    includeFontPadding: false,
  },
  tabItem: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  tabIcon: {
    marginTop: 2,
    marginBottom: 0,
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
