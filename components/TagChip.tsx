import { Pressable, StyleSheet, Text, View } from 'react-native';

import { discover, type } from '../lib/theme';
import { formatCount } from '../lib/types';

export type TagChipVariant = 'bordo' | 'gold' | 'outline';

// Keşfet'in "aynı renkte olmayan" hashtag kartları — spec bilinçli olarak
// tek bir chip stiline izin vermiyor, konunun ne kadar "ısındığını" renkle
// de hissettirmek istiyor (bordo = güçlü, altın = öne çıkan, outline = sakin).
export function TagChip({
  tag,
  count,
  variant = 'outline',
  badge,
  onPress,
}: {
  tag: string;
  count?: number;
  variant?: TagChipVariant;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles[variant], pressed && { opacity: 0.75 }]}
    >
      <Text style={[styles.tag, tagLabelStyle[variant]]} numberOfLines={1}>
        {badge ? `${badge} ` : ''}#{tag}
      </Text>
      {count !== undefined ? (
        <Text style={[styles.count, countLabelStyle[variant]]}>{formatCount(count)} paylaşım</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 152,
    gap: 3,
  },
  bordo: {
    backgroundColor: discover.bordo,
  },
  gold: {
    backgroundColor: discover.goldLight,
  },
  outline: {
    backgroundColor: discover.cream,
    borderWidth: 1.3,
    borderColor: discover.bordo,
  },
  tag: {
    fontFamily: type.bodyBold,
    fontSize: 15,
  },
  count: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});

const tagLabelStyle: Record<TagChipVariant, { color: string }> = {
  bordo: { color: discover.cream },
  gold: { color: discover.bordoDeep },
  outline: { color: discover.bordo },
};

const countLabelStyle: Record<TagChipVariant, { color: string }> = {
  bordo: { color: 'rgba(251,243,230,0.72)' },
  gold: { color: 'rgba(74,18,32,0.65)' },
  outline: { color: discover.inkSoft },
};
