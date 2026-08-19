import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { editorial } from '../../lib/theme';
import { ArrowLeftIcon } from '../icons';

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
        <ArrowLeftIcon size={20} color={editorial.ink} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {right ?? <View style={{ width: 36 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Fraunces_500Medium_Italic',
    fontSize: 16,
    color: editorial.ink,
  },
});
