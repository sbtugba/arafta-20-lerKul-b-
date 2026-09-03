import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { discover, type } from '../lib/theme';
import { CloseIcon, SearchIcon } from './icons';

// Ayarlar'daki "Ayarları ara" alanıyla aynı tasarım — sade hap (pill) kutu,
// blur/filtre yok. (bkz. app/settings/index.tsx searchRow)
export function DiscoverSearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <SearchIcon size={15} color={discover.inkSoft} />
      <TextInput
        style={styles.input}
        placeholder="Konuları ara..."
        placeholderTextColor={discover.inkSoft}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} style={styles.clearBtn}>
          <CloseIcon size={10} color={discover.cream} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: discover.creamSecondary,
    borderWidth: 1,
    borderColor: 'rgba(42,24,16,0.13)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: type.body,
    fontSize: 14,
    color: discover.ink,
    padding: 0,
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: discover.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
