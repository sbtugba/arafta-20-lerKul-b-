import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { RowButton } from '../../components/editorial/RowButton';

export default function CommunitySafetyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Topluluk ve Güvenlik" />
      <ScrollView style={styles.scroll}>
        <SettingsSection last>
          <RowButton label="Topluluk Kuralları" soon onPress={() => {}} />
          <RowButton label="Güvenli kullanım rehberi" soon onPress={() => {}} />
          <RowButton label="Gizlilik Politikası" soon onPress={() => {}} />
          <RowButton label="Kullanım Koşulları" soon onPress={() => {}} last />
        </SettingsSection>
        <Text style={styles.note}>
          Bir paylaşımı raporlamak için akışta o paylaşımın sağ üstündeki ••• menüsünü kullanabilirsin.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
  note: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 19,
    color: editorial.inkFaint,
    paddingVertical: 14,
  },
});
