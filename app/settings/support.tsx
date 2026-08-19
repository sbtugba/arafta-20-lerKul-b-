import { Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { editorial } from '../../lib/theme';
import { ScreenHeader } from '../../components/editorial/ScreenHeader';
import { SettingsSection } from '../../components/editorial/SettingsSection';
import { RowButton } from '../../components/editorial/RowButton';

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Yardım ve Destek" />
      <ScrollView style={styles.scroll}>
        <SettingsSection last>
          <RowButton label="Yardım Merkezi" soon onPress={() => {}} />
          <RowButton label="Sık Sorulan Sorular" soon onPress={() => {}} />
          <RowButton label="Bize Ulaşın" value="destek@arafta.app" onPress={() => Linking.openURL('mailto:destek@arafta.app')} />
          <RowButton label="Sorun Bildir" onPress={() => Linking.openURL('mailto:destek@arafta.app?subject=Sorun%20Bildirimi')} />
          <RowButton label="Geri Bildirim Gönder" onPress={() => Linking.openURL('mailto:destek@arafta.app?subject=Geri%20Bildirim')} last />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: editorial.cream },
  scroll: { flex: 1, paddingHorizontal: 20 },
});
