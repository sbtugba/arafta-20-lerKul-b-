import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { CheckIcon } from '../../components/icons';

export default function LanguageScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Dil" />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.flag}>🇹🇷</Text>
          <Text style={styles.label}>Türkçe</Text>
          <CheckIcon size={16} color={editorial.burgundy} />
        </View>
        <View style={[styles.row, styles.rowDisabled]}>
          <Text style={styles.flag}>🇬🇧</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>English</Text>
            <Text style={styles.soon}>Yakında</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  content: { paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: editorial.line,
  },
  rowDisabled: { opacity: 0.5 },
  flag: { fontSize: 18 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14.5, color: editorial.ink, flex: 1 },
  soon: { fontFamily: 'Inter_400Regular', fontSize: 12, color: editorial.inkFaint, marginTop: 2 },
});
