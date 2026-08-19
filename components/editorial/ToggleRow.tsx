import { Pressable, StyleSheet, Text, View } from 'react-native';

import { editorial } from '../../lib/theme';

export function ToggleRow({
  label,
  value,
  on,
  onToggle,
  locked = false,
  last = false,
}: {
  label: string;
  value?: string;
  on: boolean;
  onToggle?: () => void;
  locked?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.label}>{label}</Text>
        {value ? <Text style={styles.value}>{value}</Text> : null}
      </View>
      <Pressable
        onPress={locked ? undefined : onToggle}
        style={[styles.toggle, on && styles.toggleOn, locked && styles.toggleLocked]}
        hitSlop={6}
      >
        <View style={[styles.knob, on && styles.knobOn]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  value: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: editorial.inkFaint,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: editorial.beige,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: editorial.burgundy,
  },
  toggleLocked: {
    opacity: 0.55,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: editorial.cream,
  },
  knobOn: {
    transform: [{ translateX: 18 }],
  },
});
