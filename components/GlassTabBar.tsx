import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, type } from '../lib/theme';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { BellIcon, FeedIcon, PersonIcon, PlusIcon, SearchIcon } from './icons';

type TabDef = {
  path: '/' | '/discover' | '/notifications' | '/profile';
  name: string;
  icon: typeof FeedIcon;
  activeColor: string;
};

const TABS_LEFT: TabDef[] = [
  { path: '/', name: 'Akış', icon: FeedIcon, activeColor: colors.bordoDeep },
  { path: '/discover', name: 'Keşfet', icon: SearchIcon, activeColor: colors.bordo },
];

const TABS_RIGHT: TabDef[] = [
  { path: '/notifications', name: 'Bildirim', icon: BellIcon, activeColor: colors.bordo },
  { path: '/profile', name: 'Profil', icon: PersonIcon, activeColor: colors.bordoDeep },
];

// Sakin, ince bir zemin — Arafta'nın "eşikte olma" fikri asıl ortadaki
// yükselen ışıkta (paylaş butonu) taşınıyor, bar kendisi dikkat çekmemeli.
export function GlassTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const unreadCount = useUnreadNotificationCount();

  function renderTab(tab: TabDef) {
    const focused = pathname === tab.path;
    const color = focused ? tab.activeColor : colors.bordoMuted;
    const Icon = tab.icon;
    const showDot = tab.path === '/notifications' && unreadCount > 0;
    return (
      <Pressable key={tab.path} style={styles.btn} onPress={() => router.replace(tab.path)}>
        <View>
          <Icon size={18} color={color} />
          {showDot ? <View style={styles.dot} /> : null}
        </View>
        <Text style={[styles.label, { color }]}>{tab.name}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 14 }]} pointerEvents="box-none">
      <BlurView intensity={22} tint="light" style={styles.bar}>
        {TABS_LEFT.map(renderTab)}
        <View style={styles.fabGap} />
        {TABS_RIGHT.map(renderTab)}
      </BlurView>

      <Pressable style={styles.fabWrap} onPress={() => router.push('/share')} hitSlop={6} accessibilityLabel="Paylaş">
        <View style={styles.fabGlow} pointerEvents="none" />
        <LinearGradient colors={[colors.bordo, colors.bordoDeep]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fab}>
          <PlusIcon size={17} color={colors.goldPale} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(251,243,230,0.88)',
    shadowColor: colors.bordoDeep,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  btn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
    minWidth: 52,
  },
  fabGap: {
    width: 52,
  },
  label: {
    fontFamily: type.bodySemibold,
    fontSize: 10.5,
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bordo,
  },
  fabWrap: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,200,136,0.35)',
    shadowColor: colors.bordoDeep,
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 9,
  },
  fabGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 35,
    backgroundColor: colors.goldPale,
    opacity: 0.16,
  },
});
