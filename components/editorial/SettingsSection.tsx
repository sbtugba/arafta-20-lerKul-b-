import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { editorial } from '../../lib/theme';

export function SettingsSection({ label, sub, children, last = false }: { label?: string; sub?: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.section, !last && styles.sectionBorder]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
  },
  sectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: editorial.burgundy,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: editorial.inkFaint,
    lineHeight: 17,
    marginBottom: 10,
  },
});
