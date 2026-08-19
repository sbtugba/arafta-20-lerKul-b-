import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, type } from '../lib/theme';
import { BellIcon, FeedIcon, PersonIcon, SearchIcon, SparkleIcon } from './icons';

type TabDef = { path: '/' | '/discover' | '/notifications' | '/profile'; name: string; icon: typeof FeedIcon };

const TABS: TabDef[] = [
  { path: '/', name: 'Akış', icon: FeedIcon },
  { path: '/discover', name: 'Keşfet', icon: SearchIcon },
];

const TABS_RIGHT: TabDef[] = [
  { path: '/notifications', name: 'Bildirim', icon: BellIcon },
  { path: '/profile', name: 'Profil', icon: PersonIcon },
];

export function GlassTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  function renderTab(tab: (typeof TABS)[number]) {
    const focused = pathname === tab.path;
    const color = focused ? colors.bordo : colors.bordoMuted;
    const Icon = tab.icon;
    return (
      <Pressable key={tab.path} style={styles.btn} onPress={() => router.replace(tab.path)}>
        <Icon color={color} />
        <Text style={[styles.label, { color }]}>{tab.name}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 14 }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="light" style={styles.bar}>
        {TABS.map(renderTab)}

        <Pressable style={styles.fab} onPress={() => router.push('/share')} hitSlop={8}>
          <SparkleIcon size={19} color={colors.goldPale} />
        </Pressable>

        {TABS_RIGHT.map(renderTab)}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(251,243,230,0.55)',
  },
  btn: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  label: {
    fontFamily: type.bodySemibold,
    fontSize: 10,
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginTop: -26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bordo,
    shadowColor: colors.bordoDeep,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 5,
    borderColor: colors.cream,
  },
});
