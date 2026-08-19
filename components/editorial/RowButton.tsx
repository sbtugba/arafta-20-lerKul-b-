import { Pressable, StyleSheet, Text, View } from 'react-native';

import { editorial } from '../../lib/theme';
import { ChevronRightIcon } from '../icons';

export function RowButton({
  label,
  value,
  onPress,
  danger = false,
  soon = false,
  last = false,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  soon?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable onPress={soon ? undefined : onPress} style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
        {value ? (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {soon ? <Text style={styles.soon}>Yakında</Text> : <ChevronRightIcon size={16} color={editorial.inkFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    color: editorial.ink,
  },
  labelDanger: {
    color: editorial.error,
  },
  value: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: editorial.inkFaint,
    marginTop: 2,
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
