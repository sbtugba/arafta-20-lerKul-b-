import { Pressable, StyleSheet, Text, View } from 'react-native';

import { editorial } from '../../lib/theme';
import { ChevronRightIcon } from '../icons';

export function SelectRow({
  label,
  value,
  onPress,
  soon = false,
  last = false,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  soon?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable onPress={soon ? undefined : onPress} style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {soon ? (
          <Text style={styles.soon}>Yakında</Text>
        ) : (
          <>
            <Text style={styles.value}>{value}</Text>
            <ChevronRightIcon size={16} color={editorial.inkFaint} />
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 13,
    minHeight: 44,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    color: editorial.ink,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: editorial.inkFaint,
  },
  soon: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: editorial.inkFaint,
    backgroundColor: editorial.ivory,
    borderWidth: 1,
    borderColor: editorial.line,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
});
