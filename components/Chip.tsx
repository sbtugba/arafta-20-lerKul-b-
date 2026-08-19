import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, type } from '../lib/theme';

export function Chip({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.chip,
    backgroundColor: colors.creamDim,
  },
  chipActive: {
    backgroundColor: colors.bordo,
  },
  label: {
    fontFamily: type.bodySemibold,
    fontSize: 13,
    color: colors.bordo,
  },
  labelActive: {
    color: colors.cream,
  },
});
