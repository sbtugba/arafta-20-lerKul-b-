import { Pressable, StyleSheet, Text, View } from 'react-native';

import { discover, type } from '../lib/theme';
import { formatCount } from '../lib/types';

export function TodayTopicRow({
  tag,
  count,
  rank,
  onPress,
}: {
  tag: string;
  count: number;
  rank: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={styles.left}>
        <Text style={styles.rank}>{rank}</Text>
        <Text style={styles.tag} numberOfLines={1}>
          #{tag}
        </Text>
      </View>
      <Text style={styles.count}>{formatCount(count)} paylaşım</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74,18,32,0.1)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rank: {
    fontFamily: type.display,
    fontSize: 15,
    color: discover.bordoLight,
    width: 16,
  },
  tag: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    color: discover.ink,
    flexShrink: 1,
  },
  count: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: discover.inkSoft,
    fontVariant: ['tabular-nums'],
  },
});
