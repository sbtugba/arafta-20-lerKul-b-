import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { colors, type } from '../lib/theme';
import { BellIcon } from './icons';

// §12 — a scroll-edge mask instead of a permanent hard divider: it only
// appears once content has actually scrolled in behind the bar.
export function TopBar({ scrollY }: { scrollY?: SharedValue<number> }) {
  const edgeStyle = useAnimatedStyle(() => ({
    opacity: scrollY ? interpolate(scrollY.value, [0, 24], [0, 1], 'clamp') : 0,
  }));

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.wordmark}>arafta.</Text>
        <Pressable style={styles.bell} onPress={() => router.push('/notifications')} hitSlop={8}>
          <BellIcon size={17} color={colors.bordo} />
          <View style={styles.dot} />
        </Pressable>
      </View>
      <Animated.View style={[styles.edge, edgeStyle]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  wordmark: {
    fontFamily: type.display,
    fontSize: 19,
    color: colors.bordo,
  },
  bell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.creamDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.creamDim,
  },
  edge: {
    height: 10,
    marginTop: -10,
    backgroundColor: 'transparent',
    shadowColor: colors.bordoInk,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
