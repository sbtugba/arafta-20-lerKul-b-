import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { editorial } from '../../lib/theme';

export function TextLink({ onPress, children, tone = 'soft' }: { onPress: () => void; children: ReactNode; tone?: 'soft' | 'danger' }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.link}>
      <Text style={[styles.text, tone === 'danger' && styles.textDanger]}>{children}</Text>
    </Pressable>
  );
}

export function TextLinkEmphasis({ children }: { children: ReactNode }) {
  return <Text style={styles.emphasis}>{children}</Text>;
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: editorial.inkSoft,
    textAlign: 'center',
  },
  textDanger: {
    color: editorial.error,
  },
  emphasis: {
    fontFamily: 'Inter_700Bold',
    color: editorial.burgundy,
  },
});
