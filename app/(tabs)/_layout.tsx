import { View } from 'react-native';
import { Slot } from 'expo-router';

import { colors } from '../../lib/theme';
import { GlassTabBar } from '../../components/GlassTabBar';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Slot />
      <GlassTabBar />
    </View>
  );
}
