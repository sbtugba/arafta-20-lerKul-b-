import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../lib/theme';

export function TopicRow({
  tag,
  count,
  quote,
  onPress,
}: {
  tag: string;
  count: string;
  quote: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={styles.top}>
        <Text style={styles.tag}>#{tag}</Text>
        <Text style={styles.count}>{count} kişi</Text>
      </View>
      <Text style={styles.quote} numberOfLines={2}>
        &quot;{quote}&quot;
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamLine,
    gap: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    fontFamily: type.bodyBold,
    fontSize: 15.5,
    color: colors.bordo,
  },
  count: {
    fontFamily: type.bodyBold,
    fontSize: 13,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  quote: {
    fontFamily: type.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.bordoMuted,
  },
});
